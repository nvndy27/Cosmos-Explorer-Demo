#!/usr/bin/env python3
"""Optional read-only loopback HTTP API for the SQLite catalog snapshot."""

from __future__ import annotations

import argparse
from contextlib import closing
import ipaddress
import json
import re
import sqlite3
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB = ROOT / ".automation" / "catalog.sqlite"
OBJECT_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
PAGE_NUMBER = re.compile(r"^[0-9]{1,7}$")


class APIError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def readonly_connection(database: Path) -> sqlite3.Connection:
    if not database.is_file():
        raise FileNotFoundError(f"Catalog database does not exist: {database}")
    connection = sqlite3.connect(database.resolve().as_uri() + "?mode=ro", uri=True, timeout=3)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA query_only = ON")
    return connection


def json_load(text: str) -> Any:
    return json.loads(text)


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


class CatalogRequestHandler(BaseHTTPRequestHandler):
    server_version = "CosmosCatalogAPI/1.0"
    database_path: Path

    def log_message(self, format: str, *args: Any) -> None:
        # Search terms stay in memory only; do not log request URLs or queries.
        return None

    def send_error(self, code: int, message: str | None = None, explain: str | None = None) -> None:
        status = 405 if code == 501 else code
        text = "Method not allowed" if status == 405 else (message or "Request error")
        body = json.dumps({"error": {"status": status, "message": text}}, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if status == 405:
            self.send_header("Allow", "GET, HEAD")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send(self, status: int, payload: dict[str, Any] | None, *, head: bool = False) -> None:
        body = b"" if payload is None else json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if not head and body:
            self.wfile.write(body)

    def _error(self, status: int, message: str, *, head: bool = False) -> None:
        self._send(status, {"error": {"status": status, "message": message}}, head=head)

    def _request_target(self) -> tuple[str, dict[str, str]]:
        try:
            parsed = urlsplit(self.path)
            decoded_path = unquote(parsed.path, errors="strict")
        except (UnicodeDecodeError, ValueError):
            raise APIError(400, "Invalid request path") from None
        if parsed.scheme or parsed.netloc or not decoded_path.startswith("/") or decoded_path.startswith("//"):
            raise APIError(400, "Invalid request target")
        if "\\" in decoded_path or "\x00" in decoded_path:
            raise APIError(400, "Invalid request path")
        if any(segment in (".", "..") for segment in decoded_path.split("/")):
            raise APIError(400, "Path traversal is not allowed")
        try:
            raw_query = parse_qs(parsed.query, keep_blank_values=True, strict_parsing=True, max_num_fields=8)
        except ValueError:
            raise APIError(400, "Invalid query string") from None
        allowed = {"q", "type", "page", "page_size"}
        if set(raw_query) - allowed or any(len(values) != 1 for values in raw_query.values()):
            raise APIError(400, "Unsupported or repeated query parameter")
        return decoded_path, {key: values[0] for key, values in raw_query.items()}

    def _db(self) -> sqlite3.Connection:
        return readonly_connection(self.server.database_path)

    def _list_objects(self, params: dict[str, str]) -> dict[str, Any]:
        query = params.get("q", "")
        object_type = params.get("type", "")
        if len(query) > 200 or len(object_type) > 64:
            raise APIError(400, "Search and type filters exceed their length limits")
        page_text = params.get("page", "1")
        size_text = params.get("page_size", "20")
        if not PAGE_NUMBER.fullmatch(page_text) or not PAGE_NUMBER.fullmatch(size_text):
            raise APIError(400, "page and page_size must be positive integers")
        page, page_size = int(page_text), int(size_text)
        if page < 1 or page > 1_000_000 or page_size < 1 or page_size > 100:
            raise APIError(400, "page must be 1..1000000 and page_size must be 1..100")
        offset = (page - 1) * page_size

        clauses: list[str] = []
        values: list[Any] = []
        if query:
            pattern = f"%{_escape_like(query)}%"
            clauses.append("(id LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR COALESCE(small, '') LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM object_aliases AS oa WHERE oa.object_id = objects.id AND oa.alias LIKE ? ESCAPE '\\'))")
            values.extend([pattern] * 4)
        if object_type:
            clauses.append("type = ?")
            values.append(object_type)
        where = " WHERE " + " AND ".join(clauses) if clauses else ""

        with closing(self._db()) as connection:
            total = connection.execute("SELECT count(*) FROM objects" + where, values).fetchone()[0]
            rows = connection.execute(
                "SELECT id, name, small, level, type, classification, system FROM objects"
                + where + " ORDER BY name COLLATE NOCASE, id LIMIT ? OFFSET ?",
                [*values, page_size, offset],
            ).fetchall()
        items = [dict(row) for row in rows]
        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": total,
            "next_page": page + 1 if offset + len(items) < total else None,
        }

    def _object_detail(self, object_id: str) -> dict[str, Any]:
        if not OBJECT_ID.fullmatch(object_id):
            raise APIError(400, "Invalid object ID")
        with closing(self._db()) as connection:
            row = connection.execute("SELECT raw_json FROM objects WHERE id = ?", (object_id,)).fetchone()
            if row is None:
                raise APIError(404, "Object not found")
            sources = connection.execute(
                """SELECT os.role, os.label, os.ordinal, s.url
                   FROM object_sources AS os JOIN sources AS s ON s.id = os.source_id
                   WHERE os.object_id = ? ORDER BY os.role, os.ordinal""",
                (object_id,),
            ).fetchall()
            measurements = connection.execute(
                """SELECT m.metric_key, m.raw_json, s.url AS source_url
                   FROM measurements AS m LEFT JOIN sources AS s ON s.id = m.source_id
                   WHERE m.object_id = ? ORDER BY m.metric_key""",
                (object_id,),
            ).fetchall()
            images = connection.execute(
                """SELECT i.raw_json FROM object_images AS oi
                   JOIN images AS i ON i.id = oi.image_id WHERE oi.object_id = ?""",
                (object_id,),
            ).fetchall()
        return {
            "record": json_load(row["raw_json"]),
            "sources": [dict(source) for source in sources],
            "measurements": {measurement["metric_key"]: json_load(measurement["raw_json"]) for measurement in measurements},
            "images": [json_load(image["raw_json"]) for image in images],
        }

    def _handle(self, *, head: bool = False) -> None:
        try:
            path, params = self._request_target()
            if path in ("/api/objects", "/api/objects/"):
                payload = self._list_objects(params)
            elif path.startswith("/api/objects/"):
                if params:
                    raise APIError(400, "Query parameters are only supported on the collection endpoint")
                payload = self._object_detail(path.removeprefix("/api/objects/"))
            else:
                raise APIError(404, "Endpoint not found")
            self._send(200, payload, head=head)
        except APIError as error:
            self._error(error.status, error.message, head=head)
        except (OSError, sqlite3.Error, json.JSONDecodeError) as error:
            self.log_error("request failed: %s", error)
            self._error(500, "Catalog service error", head=head)

    def do_GET(self) -> None:
        self._handle()

    def do_HEAD(self) -> None:
        self._handle(head=True)

    def _method_not_allowed(self) -> None:
        self.send_response(405)
        self.send_header("Allow", "GET, HEAD")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        body = json.dumps({"error": {"status": 405, "message": "Method not allowed"}}, separators=(",", ":")).encode()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    do_POST = _method_not_allowed
    do_PUT = _method_not_allowed
    do_PATCH = _method_not_allowed
    do_DELETE = _method_not_allowed
    do_OPTIONS = _method_not_allowed
    do_TRACE = _method_not_allowed


class CatalogHTTPServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def make_server(database: Path, host: str = "127.0.0.1", port: int = 8000) -> CatalogHTTPServer:
    try:
        loopback = ipaddress.ip_address(host).is_loopback
    except ValueError:
        loopback = False
    if not loopback:
        raise ValueError("API host must be a loopback IP address")
    resolved_db = database.resolve()
    with closing(readonly_connection(resolved_db)) as connection:
        version = connection.execute("PRAGMA user_version").fetchone()[0]
        if version < 1 or connection.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='objects'").fetchone() is None:
            raise ValueError("Database does not contain a migrated catalog schema")
    server = CatalogHTTPServer((host, port), CatalogRequestHandler)
    server.database_path = resolved_db
    return server


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--host", default="127.0.0.1", help="loopback IP only")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error("--port must be between 0 and 65535")
    try:
        server = make_server(args.db, args.host, args.port)
    except (OSError, ValueError, sqlite3.Error) as error:
        parser.error(str(error))
    print(json.dumps({"listening": f"http://{server.server_address[0]}:{server.server_address[1]}", "database": str(args.db.resolve())}), flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
