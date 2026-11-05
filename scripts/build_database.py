#!/usr/bin/env python3
"""Build the ignored SQLite catalog snapshot atomically from runtime sources."""

from __future__ import annotations

import argparse
from contextlib import closing
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "database" / "migrations"
DEFAULT_OUTPUT = Path(".automation/catalog.sqlite")
MIGRATION_NAME = re.compile(r"^(\d{3})_([a-z0-9_]+)\.sql$")


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def export_runtime_catalog(root: Path = ROOT) -> dict[str, Any]:
    node = shutil.which("node")
    if not node:
        raise RuntimeError("Node.js is required to evaluate the trusted runtime catalog")
    exporter = root / "scripts" / "export_catalog.cjs"
    completed = subprocess.run(
        [node, str(exporter)],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=90,
        shell=False,
    )
    payload = json.loads(completed.stdout)
    if not isinstance(payload.get("objects"), list) or not isinstance(payload.get("images"), list):
        raise ValueError("Catalog exporter output must contain objects and images arrays")
    return payload


def migration_files(directory: Path = MIGRATIONS) -> list[tuple[int, str, Path]]:
    migrations: list[tuple[int, str, Path]] = []
    for path in sorted(directory.glob("*.sql")):
        match = MIGRATION_NAME.fullmatch(path.name)
        if not match:
            raise ValueError(f"Migration filename must be NNN_name.sql: {path.name}")
        migrations.append((int(match.group(1)), match.group(2), path))
    if not migrations or [version for version, _, _ in migrations] != list(range(1, len(migrations) + 1)):
        raise ValueError("Migration versions must be contiguous and start at 001")
    return migrations


def apply_migrations(connection: sqlite3.Connection, directory: Path = MIGRATIONS) -> None:
    connection.execute("PRAGMA foreign_keys = ON")
    for version, name, path in migration_files(directory):
        current = int(connection.execute("PRAGMA user_version").fetchone()[0])
        if version <= current:
            continue
        if version != current + 1:
            raise RuntimeError(f"Cannot apply migration {version}; current database version is {current}")
        connection.executescript(path.read_text(encoding="utf-8"))
        recorded = connection.execute(
            "SELECT name FROM schema_migrations WHERE version = ?", (version,)
        ).fetchone()
        if not recorded or recorded[0] != f"{version:03d}_{name}" and recorded[0] != name:
            raise RuntimeError(f"Migration {path.name} did not record its version/name")
        if int(connection.execute("PRAGMA user_version").fetchone()[0]) != version:
            raise RuntimeError(f"Migration {path.name} did not set PRAGMA user_version")


def source_urls(payload: dict[str, Any]) -> set[str]:
    urls: set[str] = set()

    def add(url: Any) -> None:
        if isinstance(url, str) and url.strip():
            urls.add(url.strip())

    for obj in payload["objects"]:
        add(obj.get("source"))
        add(obj.get("imageSource"))
        for field in ("references", "papers", "extraReferences"):
            for entry in obj.get(field) or []:
                if isinstance(entry, (list, tuple)) and len(entry) > 1:
                    add(entry[1])
                elif isinstance(entry, dict):
                    add(entry.get("url"))
        for url in obj.get("statSources") or []:
            add(url)
        for measurement in (obj.get("measurements") or {}).values():
            if isinstance(measurement, dict):
                add(measurement.get("source"))
    for image in payload["images"]:
        add(image.get("source"))
        add(image.get("download"))
    return urls


def source_associations(obj: dict[str, Any]) -> list[tuple[str, str, str, int]]:
    rows: list[tuple[str, str, str, int]] = []
    if obj.get("source"):
        rows.append(("primary", "Nguồn hồ sơ", str(obj["source"]), 0))
    for field, role in (("references", "reference"), ("papers", "paper"), ("extraReferences", "extra_reference")):
        for index, entry in enumerate(obj.get(field) or []):
            if isinstance(entry, (list, tuple)) and len(entry) > 1:
                label, url = entry[0], entry[1]
            elif isinstance(entry, dict):
                label, url = entry.get("title", ""), entry.get("url")
            else:
                continue
            if isinstance(url, str) and url.strip():
                rows.append((role, str(label or ""), url.strip(), index))
    for index, url in enumerate(obj.get("statSources") or []):
        if isinstance(url, str) and url.strip():
            label = (obj.get("stats") or [])[index][0] if index < len(obj.get("stats") or []) else f"Thông số {index + 1}"
            rows.append(("stat", str(label), url.strip(), index))
    return rows


def build_rows(connection: sqlite3.Connection, payload: dict[str, Any]) -> dict[str, int]:
    objects = payload["objects"]
    images = payload["images"]
    object_by_id = {obj["id"]: obj for obj in objects}
    if len(object_by_id) != len(objects):
        raise ValueError("Duplicate object ID in runtime catalog")
    image_by_id = {image["id"]: image for image in images}
    if len(image_by_id) != len(images):
        raise ValueError("Duplicate image ID in manifest")
    runtime_images = {obj["id"]: obj["image"] for obj in objects if obj.get("image")}
    if set(runtime_images) != set(image_by_id):
        raise ValueError("Runtime image records and manifest IDs differ")
    for image_id, manifest_image in image_by_id.items():
        if runtime_images[image_id] != manifest_image.get("file"):
            raise ValueError(f"Runtime image path differs from manifest for {image_id}")

    urls = source_urls(payload)
    if any("://" not in url for url in urls):
        raise ValueError("Source URLs must include a URL scheme")
    connection.executemany("INSERT INTO sources(url) VALUES (?)", [(url,) for url in sorted(urls)])
    source_ids = {url: source_id for url, source_id in connection.execute("SELECT url, id FROM sources")}

    object_rows = []
    object_alias_rows = []
    for obj in sorted(objects, key=lambda item: item["id"]):
        raw = json_text(obj)
        object_rows.append((
            obj["id"], obj["name"], obj.get("small"), obj["level"], obj["type"],
            obj.get("category"), obj.get("classification"), obj.get("system"),
            obj.get("summary"), raw,
        ))
        aliases = obj.get("aliases") or []
        if isinstance(aliases, str):
            aliases = [aliases]
        if isinstance(aliases, list):
            seen_aliases: set[str] = set()
            for ordinal, alias in enumerate(aliases):
                if isinstance(alias, str) and alias.strip() and alias.strip() not in seen_aliases:
                    normalized_alias = alias.strip()
                    seen_aliases.add(normalized_alias)
                    object_alias_rows.append((obj["id"], normalized_alias, ordinal))
    connection.executemany(
        """INSERT INTO objects
        (id, name, small, level, type, category, classification, system, summary, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        object_rows,
    )
    connection.executemany(
        "INSERT INTO object_aliases(object_id, alias, ordinal) VALUES (?, ?, ?)",
        object_alias_rows,
    )

    object_source_rows = []
    measurement_rows = []
    for obj in sorted(objects, key=lambda item: item["id"]):
        for role, label, url, ordinal in source_associations(obj):
            object_source_rows.append((obj["id"], source_ids[url], role, label, ordinal))
        for metric_key, measurement in sorted((obj.get("measurements") or {}).items()):
            if measurement is None:
                measurement_rows.append((obj["id"], metric_key, None, None, None, None, None, None, None, "null"))
                continue
            if not isinstance(measurement, dict):
                raise ValueError(f"Measurement {obj['id']}.{metric_key} must be an object or null")
            source = measurement.get("source")
            comparable = measurement.get("comparable")
            value = measurement.get("value")
            if value is not None:
                if isinstance(value, bool) or not isinstance(value, (int, float)):
                    raise ValueError(f"Measurement {obj['id']}.{metric_key} has a non-numeric value")
                value = float(value)
            measurement_rows.append((
                obj["id"], metric_key, value, measurement.get("unit"),
                measurement.get("definition"), source_ids.get(source) if source else None,
                None if measurement.get("limit") is None else str(measurement["limit"]),
                measurement.get("note"), None if comparable is None else int(bool(comparable)),
                json_text(measurement),
            ))
    connection.executemany(
        "INSERT INTO object_sources(object_id, source_id, role, label, ordinal) VALUES (?, ?, ?, ?, ?)",
        sorted(object_source_rows),
    )
    connection.executemany(
        """INSERT INTO measurements
        (object_id, metric_key, value, unit, definition, source_id, limit_value, note, comparable, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        measurement_rows,
    )

    image_rows = []
    object_image_rows = []
    for image in sorted(images, key=lambda item: item["id"]):
        image_rows.append((
            image["id"], image["file"], source_ids.get(image.get("source")),
            source_ids.get(image.get("download")), image.get("credit"), image.get("classification"),
            image.get("imageKind"), image.get("caption"), image.get("retrieved"),
            image["sha256"], json_text(image),
        ))
        object_image_rows.append((image["id"], image["id"]))
    connection.executemany(
        """INSERT INTO images
        (id, file_path, source_id, download_source_id, credit, classification, image_kind,
         caption, retrieved, sha256, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        image_rows,
    )
    connection.executemany("INSERT INTO object_images(object_id, image_id) VALUES (?, ?)", object_image_rows)
    connection.commit()
    violations = connection.execute("PRAGMA foreign_key_check").fetchall()
    if violations:
        raise sqlite3.IntegrityError(f"Foreign key violations after build: {violations[:5]}")
    integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
    if integrity != "ok":
        raise sqlite3.DatabaseError(f"SQLite integrity check failed: {integrity}")
    return {
        "objects": len(object_rows),
        "aliases": len(object_alias_rows),
        "measurements": len(measurement_rows),
        "sources": len(urls),
        "images": len(image_rows),
        "object_sources": len(object_source_rows),
        "object_images": len(object_image_rows),
    }


def build_database(payload: dict[str, Any], destination: Path, migrations: Path = MIGRATIONS) -> dict[str, int]:
    destination = destination.resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary_name = tempfile.mkstemp(prefix=f".{destination.name}.", suffix=".tmp", dir=destination.parent)
    os.close(fd)
    temporary = Path(temporary_name)
    try:
        with closing(sqlite3.connect(temporary)) as connection:
            connection.execute("PRAGMA foreign_keys = ON")
            apply_migrations(connection, migrations)
            connection.execute("BEGIN IMMEDIATE")
            counts = build_rows(connection, payload)
        os.replace(temporary, destination)
        return counts
    finally:
        if temporary.exists():
            temporary.unlink()


def output_path(root: Path, requested: str) -> Path:
    candidate = Path(requested)
    if candidate.suffix.lower() not in {".sqlite", ".sqlite3", ".db"}:
        raise ValueError("--output must use .sqlite, .sqlite3 or .db to protect source files")
    if candidate.is_absolute():
        raise ValueError("--output must be relative to this worktree")
    resolved = (root / candidate).resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError("--output must remain inside this worktree")
    return resolved


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="worktree-relative SQLite path")
    args = parser.parse_args()
    try:
        destination = output_path(ROOT, args.output)
        payload = export_runtime_catalog(ROOT)
        counts = build_database(payload, destination)
        print(json.dumps({"database": str(destination), "counts": counts, "schema_version": len(migration_files())}, indent=2))
        return 0
    except (OSError, ValueError, RuntimeError, sqlite3.Error, subprocess.SubprocessError, json.JSONDecodeError) as error:
        print(f"Database build failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
