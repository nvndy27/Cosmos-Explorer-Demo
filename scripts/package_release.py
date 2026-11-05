#!/usr/bin/env python3
"""Build a reproducible offline ZIP release of Cosmos Explorer."""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path, PurePosixPath
import stat
import sys
import zipfile


ARCHIVE_NAME = "cosmos-explorer-release.zip"
ROOT_NAME = "cosmos-explorer"
ZIP_TIME = (2020, 1, 1, 0, 0, 0)
EXCLUDED_DIRS = {".git", "automation", "dist", "__pycache__", "tests"}


def excluded(path: Path) -> bool:
    parts = path.parts
    if any(part in EXCLUDED_DIRS for part in parts):
        return True
    name = path.name.lower()
    return "token" in name or name == ".env" or name.startswith(".env.")


def safe_archive_path(relative: Path) -> str:
    """Return a canonical ZIP path and reject traversal-like components."""
    posix = PurePosixPath(*relative.parts)
    if posix.is_absolute() or any(part in {"", ".", ".."} for part in posix.parts):
        raise ValueError(f"Unsafe path: {relative}")
    if any("\\" in part or (index == 0 and ":" in part) for index, part in enumerate(posix.parts)):
        raise ValueError(f"Unsafe path: {relative}")
    return posix.as_posix()


def collect_files(source: Path, output_zip: Path) -> list[tuple[Path, str]]:
    collected = []
    for path in source.rglob("*"):
        relative = path.relative_to(source)
        if excluded(relative):
            continue
        if path.is_symlink():
            raise ValueError(f"Symlinks are not supported in release input: {relative}")
        if not path.is_file():
            continue
        if path.resolve() == output_zip.resolve():
            continue
        archive_path = safe_archive_path(Path(ROOT_NAME) / relative)
        collected.append((path, archive_path))
    return sorted(collected, key=lambda item: item[1])


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def guide_bytes() -> bytes:
    return (
        "Cosmos Explorer — hướng dẫn mở bản ngoại tuyến\n"
        "================================================\n\n"
        "Giải nén toàn bộ ZIP, sau đó mở cosmos-explorer/index.html bằng trình duyệt.\n"
        "Ứng dụng chạy trực tiếp từ file:// và giữ các tệp cùng thư mục để tải ảnh,\n"
        "kiểu chữ và dữ liệu cục bộ.\n"
    ).encode("utf-8")


def build(source: Path, output_dir: Path) -> Path:
    source = source.resolve(strict=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_zip = output_dir / ARCHIVE_NAME
    if not (source / "index.html").is_file():
        raise FileNotFoundError(f"Missing entry point: {source / 'index.html'}")

    files = collect_files(source, output_zip)
    if not any(name == f"{ROOT_NAME}/index.html" for _, name in files):
        raise ValueError("index.html was excluded from the release")

    guide_name = f"{ROOT_NAME}/OPEN-README.txt"
    reserved = {guide_name, f"{ROOT_NAME}/SHA256SUMS"}
    if any(name in reserved for _, name in files):
        raise ValueError("Release input contains a reserved generated filename")
    guide = guide_bytes()
    manifest_rows = [(sha256_file(path), name) for path, name in files]
    manifest_rows.append((hashlib.sha256(guide).hexdigest(), guide_name))
    manifest = ("".join(f"{digest}  {name}\n" for digest, name in sorted(manifest_rows, key=lambda row: row[1]))).encode("utf-8")

    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path, name in files:
            info = zipfile.ZipInfo(name, date_time=ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            archive.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        for name, data in ((guide_name, guide), (f"{ROOT_NAME}/SHA256SUMS", manifest)):
            info = zipfile.ZipInfo(name, date_time=ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            archive.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return output_zip


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, help="Thư mục lưu ZIP (mặc định: <repo>/dist)")
    args = parser.parse_args(argv)
    repo = Path(__file__).resolve().parents[1]
    source = repo / ROOT_NAME
    output_dir = args.output_dir if args.output_dir is not None else repo / "dist"
    try:
        result = build(source, output_dir)
    except (OSError, ValueError, zipfile.BadZipFile) as error:
        print(f"Lỗi đóng gói: {error}", file=sys.stderr)
        return 1
    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
