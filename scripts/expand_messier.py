#!/usr/bin/env python3
"""Append the reviewed 26 NASA Hubble Messier pages to the local snapshot.

Uses coordinator-supplied raw HTML, verifies its SHA-256, and downloads only the
first NASA image following Object Type. Re-running is safe and append-only.
Requires the editor environment's beautifulsoup4 and Pillow packages.
"""
from __future__ import annotations

import datetime as dt
import argparse
import hashlib
import io
import json
import os
import shutil
import sys
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup
from PIL import Image

WORK = Path(__file__).resolve().parents[1]
DATA = WORK / "cosmos-explorer" / "data"
ASSETS = WORK / "cosmos-explorer" / "assets" / "observations"
CACHE = WORK / ".automation" / "sources"
BASE = "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/"
IDS = [22, 24, 28, 30, 35, 43, 44, 45, 46, 48, 53, 54, 55, 56, 62, 67, 68, 69, 70, 71, 72, 75, 79, 80, 92, 107]
TYPES = {
    "Globular Cluster": ("Cụm sao cầu", "clusters", "cluster", "cluster"),
    "Open Cluster": ("Cụm sao mở", "clusters", "opencluster", "cluster"),
    "Spiral Galaxy": ("Thiên hà xoắn ốc", "galaxies", "galaxy", "galaxy"),
    "Elliptical Galaxy": ("Thiên hà elip", "galaxies", "elliptical", "galaxy"),
    "Lenticular Galaxy": ("Thiên hà thấu kính", "galaxies", "elliptical", "galaxy"),
    "Irregular Galaxy": ("Thiên hà bất quy tắc", "galaxies", "irregular", "galaxy"),
    "Planetary Nebula": ("Tinh vân hành tinh", "nebula", "planetarynebula", "nebula"),
    "Nebula": ("Tinh vân", "nebula", "nebula", "nebula"),
    "Emission Nebula": ("Tinh vân phát xạ", "nebula", "nebula", "nebula"),
    "Reflection Nebula": ("Tinh vân phản xạ", "nebula", "nebula", "nebula"),
    "Supernova Remnant": ("Tàn dư siêu tân tinh", "nebula", "remnant", "nebula"),
    "Star Cloud": ("Đám mây sao", "deep", "deep", "field"),
}
UTC_NOW = dt.datetime.now(dt.timezone.utc)
RETRIEVED = UTC_NOW.date().isoformat()
RETRIEVED_UTC = UTC_NOW.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "CosmosExplorerEducational/1.0", "Accept": "image/*"})
    with urllib.request.urlopen(req, timeout=45) as response:
        return response.read()


def image_url_for_download(url: str) -> str:
    parts = urllib.parse.urlsplit(url)
    query = dict(urllib.parse.parse_qsl(parts.query, keep_blank_values=True))
    if "dynamicimage" in parts.path:
        query.update(w="900", h="900", fit="clip")
        return urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query)))
    return url


def parse_one(n: int, index: dict, source_dir: Path) -> tuple[dict, dict, bytes]:
    ident = f"messier-{n}"
    metadata = index.get(ident)
    if not metadata or metadata.get("url") != BASE + f"messier-{n}/":
        raise ValueError(f"{ident}: missing/mismatched coordinator source index")
    html_path = source_dir / "independent" / f"{n}.html"
    raw = html_path.read_bytes()
    page_hash = sha(raw)
    if page_hash != metadata.get("sha256"):
        raise ValueError(f"{ident}: source HTML SHA-256 mismatch")
    index_fields = metadata.get("fields", {})
    if set(index_fields) != {"distance", "apparent magnitude", "constellation", "object type"}:
        raise ValueError(f"{ident}: incomplete source fields")
    soup = BeautifulSoup(raw, "html.parser")
    fields = {}
    for heading in soup.find_all("h2"):
        key = heading.get_text(" ", strip=True).lower()
        if key in {"distance", "apparent magnitude", "constellation", "object type"}:
            value = heading.find_next("p")
            if value:
                fields[key] = value.get_text(" ", strip=True)
    if set(fields) != set(index_fields) or fields != index_fields:
        raise ValueError(f"{ident}: parsed NASA fields differ from source index: {fields!r}")
    h = next((e for e in soup.find_all("h2") if e.get_text(" ", strip=True).lower() == "object type"), None)
    figure = h.find_next("figure") if h else None
    img = figure.find("img") if figure else None
    caption_node = figure.find_next("figcaption") if figure else None
    credit_node = caption_node.find(class_="hds-credits") if caption_node else None
    prose_node = caption_node.find(class_="hds-caption-text") if caption_node else None
    if not (img and img.get("src") and credit_node and credit_node.get_text(" ", strip=True)):
        raise ValueError(f"{ident}: first figure after Object Type lacks image or credit")
    original_image = urllib.parse.urljoin(metadata["url"], img["src"])
    download_url = image_url_for_download(original_image)
    CACHE.mkdir(parents=True, exist_ok=True)
    (CACHE / "pages").mkdir(exist_ok=True)
    (CACHE / "images").mkdir(exist_ok=True)
    cached_page = CACHE / "pages" / f"{ident}-{page_hash}.html"
    if not cached_page.exists():
        cached_page.write_bytes(raw)
    image_cache = CACHE / "images" / f"{ident}-{sha(download_url.encode())}.webp"
    if image_cache.exists():
        webp = image_cache.read_bytes()
    else:
        source_bytes = fetch(download_url)
        with Image.open(io.BytesIO(source_bytes)) as opened:
            opened.load()
            converted = opened.convert("RGB")
            converted.thumbnail((800, 800))
            out = io.BytesIO()
            converted.save(out, "WEBP", quality=84)
        webp = out.getvalue()
        image_cache.write_bytes(webp)
    with Image.open(io.BytesIO(webp)) as check:
        if check.format != "WEBP" or max(check.size) > 800:
            raise ValueError(f"{ident}: generated image violates WebP/800px limit")
    credit = credit_node.get_text(" ", strip=True)
    source_caption = prose_node.get_text(" ", strip=True) if prose_node else ""
    return ({"fields": fields, "original_image": original_image, "download_url": download_url,
             "credit": credit, "source_caption": source_caption, "alt": img.get("alt", ""),
             "page_hash": page_hash, "webp": webp}, metadata, webp)


def facts(n: int, source: dict) -> tuple[str, str, str, str, str, str, str, str, str, str]:
    f = source["fields"]
    typ = f["object type"]
    small, level, kind, classification = TYPES.get(typ, ("Đối tượng Messier", "deep", "deep", "field"))
    if n == 24:
        small, level, kind, classification = "Đám mây sao", "deep", "deep", "field"
    scope = {
        22: "Ảnh Hubble tập trung vào phần trung tâm M22.",
        24: "Ảnh chỉ bao quát một phần nhỏ Đám mây sao Sagittarius. Đây là trường sao nhìn qua khoảng trống giữa các đám mây bụi về phía cánh tay Sagittarius, không phải một cụm sao riêng.",
        35: "Ảnh ghi lại một số sao trong cụm mở M35, không phải toàn bộ cụm.",
        43: "Ảnh Hubble dùng ánh sáng khả kiến và hồng ngoại để ghi vùng tinh vân M43.",
        44: "Ảnh nhìn qua rìa tây nam của M44, gồm sao trong cụm và các thiên hà nền; không thể hiện toàn cụm.",
        45: "Ảnh chỉ cho thấy vùng tinh vân phản xạ gần sao Merope, không phải toàn bộ cụm sao Pleiades.",
        46: "Ảnh làm nổi bật tinh vân hành tinh NGC 2438 ở tiền cảnh; phần lớn sao phía sau thuộc M46. Tinh vân không phải thành viên của cụm và không dùng khoảng cách 5.400 năm ánh sáng của M46 cho tinh vân.",
        48: "Ảnh Hubble ghi lại một phần của cụm mở M48, không phải toàn bộ cụm.",
        53: "Ảnh tổng hợp quan sát khả kiến và hồng ngoại của cụm sao cầu M53.",
        54: "M54 là cụm sao cầu liên quan đến thiên hà lùn Sagittarius; không nên suy ra rằng mọi cụm sao cầu thuộc Ngân Hà.",
        55: "Ảnh chỉ cho thấy một phần M55; các kính thiên văn mặt đất cũng phân giải được một số sao riêng lẻ.",
        67: "Ảnh Hubble cho thấy một phần nhỏ các sao trong cụm mở M67.",
        71: "Ảnh dùng bộ lọc vàng và cận hồng ngoại; màu xanh/đỏ biểu diễn các bộ lọc, không phải màu mắt nhìn.",
        72: "Ảnh kỷ niệm 35 năm Hubble bổ sung dữ liệu tử ngoại mới vào các quan sát Hubble trước đó.",
        80: "Ảnh tổng hợp dữ liệu tử ngoại, khả kiến và hồng ngoại của M80.",
    }.get(n, f"Ảnh Hubble là một trường quan sát của {small.lower()}, không nhất thiết bao phủ toàn bộ đối tượng.")
    research = f"NASA phân loại M{n} là {typ}; hồ sơ ghi khoảng cách {f['distance']} và cấp sao biểu kiến {f['apparent magnitude']}. Đây là thông tin của trang NASA, không phải phép đo của ứng dụng."
    if n == 24:
        research = f"NASA gọi M24 là Star Cloud và mô tả vùng nhìn xuyên qua bụi về phía cánh tay Sagittarius. Con số khoảng cách/cấp sao ở trang là thông tin danh mục, không xác định một cụm sao riêng."
    if n == 54:
        research += " NASA mô tả M54 gắn với thiên hà lùn Sagittarius."
    if n == 46:
        research = "NASA xếp M46 là Open Cluster. NGC 2438 là tinh vân hành tinh tiền cảnh trong ảnh; không gán nó cho cụm và không áp khoảng cách M46 cho tinh vân."
    intro = f"M{n} là {small.lower()} trong danh mục Hubble của NASA, thuộc chòm sao {f['constellation']}."
    distance_vi = f["distance"].replace("light-years", "năm ánh sáng").replace("light years", "năm ánh sáng")
    features = f"{scope} NASA ghi cấp sao biểu kiến {f['apparent magnitude']} và khoảng cách xấp xỉ {distance_vi}."
    discovery = research + " Lịch sử phát hiện chưa được biên tập trong phiên bản này; xem hồ sơ NASA để đọc thêm."
    photo = scope + " Ảnh quan sát Hubble; màu hiển thị đã xử lý qua bộ lọc."
    return small, level, kind, classification, scope, research, photo, intro, features, discovery


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, default=WORK / ".automation" / "messier-wave",
                        help="Folder containing independent/ and independent-sources.json")
    source_dir = parser.parse_args().source_dir.expanduser().resolve()
    idx_rows = json.loads((source_dir / "independent-sources.json").read_text(encoding="utf-8"))
    index = {row["id"]: row for row in idx_rows}
    snapshot_path = DATA / "messier-snapshot.json"
    manifest_path = DATA / "image-manifest.json"
    snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    existing = {r["id"]: r for r in snapshot["records"]}
    provenance = {p["id"]: p for p in snapshot["provenance"]}
    images = {i["id"]: i for i in manifest["images"]}
    selected = list(snapshot["selected"])
    # Validate all 26 before mutating any catalog artifacts.
    parsed = {}
    failures = []
    for n in IDS:
        ident = f"messier-{n}"
        try:
            if ident in existing and ident not in provenance:
                raise ValueError(f"{ident}: record exists without provenance; refusing partial overwrite")
            if ident in images and ident not in existing:
                raise ValueError(f"{ident}: manifest exists without record; refusing partial overwrite")
            parsed[n] = parse_one(n, index, source_dir)
            if ident in provenance:
                p = provenance[ident]
                if p["sha256"] != parsed[n][0]["page_hash"] or p["fields"] != parsed[n][0]["fields"]:
                    raise ValueError(f"{ident}: source changed; explicit editorial review required")
        except Exception as exc:
            failures.append({"id": ident, "error": f"{type(exc).__name__}: {exc}"})
    if failures:
        print(json.dumps({"status": "failed", "failures": failures}, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1
    new_records, new_provenance, new_images, new_selected = [], [], [], []
    for n in IDS:
        ident = f"messier-{n}"
        src = parsed[n][0]
        small, level, kind, classification, scope, research, photo, intro, features, discovery = facts(n, src)
        f = src["fields"]
        distance = f["distance"].replace("light-years", "năm ánh sáng").replace("light years", "năm ánh sáng")
        local = f"assets/observations/{ident}.webp"
        record = {
            "id": ident, "name": f"Messier {n} (M{n})", "aliases": f"M{n} Messier{n} {f['object type']}",
            "small": small, "classification": classification, "level": level,
            "category": f"{small} · Hubble Messier", "kicker": "Danh mục Hubble · NASA",
            "summary": f"{small} trong chòm sao {f['constellation']}; trang NASA ghi khoảng cách {distance}.",
            "type": kind, "color": "#b8cfee" if level != "nebula" else "#d89ebc", "status": "ĐÃ QUAN SÁT",
            "visualType": "ẢNH QUAN SÁT · XỬ LÝ MÀU",
            "imageKind": "observation",
            "stats": [["Khoảng cách (xấp xỉ)", distance], ["Cấp sao biểu kiến", f["apparent magnitude"]],
                      ["Chòm sao", f["constellation"]], ["Phân loại NASA", f["object type"]]],
            "radius": None, "system": "Không áp dụng", "host": None,
            "measurements": {"radius": None, "mass": None, "period": None, "distance": None, "temperature": None},
            "fact": f"M{n} là định danh trong danh mục Messier. NASA ghi cấp sao biểu kiến {f['apparent magnitude']}; đây là độ sáng nhìn từ Trái Đất, không phải đại lượng đo bởi ứng dụng.",
            "intro": intro, "features": features, "discovery": discovery,
            "research": research, "sourceNote": "",
            "limits": "Các khoảng cách và cấp sao biểu kiến được giữ dưới dạng văn bản như trang NASA công bố; ứng dụng không suy ra đại lượng vật lý khác. Ảnh Hubble qua bộ lọc có xử lý màu và có thể chỉ bao phủ một phần trường quan sát. Sơ đồ tổng quan không phải bản đồ tọa độ thật. " + scope,
            "source": index[ident]["url"], "references": [["NASA Hubble — hồ sơ, trường nguồn và ảnh", index[ident]["url"]]],
            "papers": [], "image": local, "imageRemote": src["download_url"], "imageSource": index[ident]["url"],
            "credit": src["credit"], "photoCaption": photo, "imageAlt": src["alt"], "reviewed": RETRIEVED,
        }
        if ident not in existing:
            new_records.append(record)
            new_selected.append(n)
        else:
            for key in ("small", "classification", "level", "type", "summary", "visualType", "imageKind",
                        "intro", "features", "discovery", "research", "sourceNote", "limits", "photoCaption",
                        "credit", "imageAlt", "imageRemote", "imageSource", "image"):
                existing[ident][key] = record[key]
        prov = {"id": ident, "url": index[ident]["url"], "retrieved": RETRIEVED, "retrievedUTC": RETRIEVED_UTC,
                "sha256": src["page_hash"], "fields": f, "imageOriginal": src["original_image"],
                "imageDownloaded": src["download_url"], "credit": src["credit"], "imageCaption": src["source_caption"],
                "imageAlt": src["alt"], "imageScope": scope, "retrievalNote": "Raw NASA HTML supplied in coordinator independent cache; retrievedUTC is this verified import/cache-read time."}
        if ident not in provenance:
            new_provenance.append(prov)
        else:
            provenance[ident]["imageScope"] = scope
        image_entry = {"id": ident, "file": local, "download": src["download_url"], "source": index[ident]["url"],
                       "credit": src["credit"], "classification": "ẢNH QUAN SÁT · XỬ LÝ MÀU", "imageKind": "observation",
                       "caption": photo, "retrieved": RETRIEVED, "sha256": sha(src["webp"]),
                       "transform": {"maxWidth": 800, "maxHeight": 800, "format": "WEBP", "quality": 84}}
        if ident not in images:
            new_images.append(image_entry)
        elif images[ident].get("sha256") != image_entry["sha256"]:
            raise ValueError(f"{ident}: existing manifest hash conflicts; refusing overwrite")
        else:
            images[ident]["caption"] = image_entry["caption"]
    # Copy validated local image bytes, then atomically replace the two JSON files.
    for n in IDS:
        ident = f"messier-{n}"
        target = ASSETS / f"{ident}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        data = parsed[n][0]["webp"]
        if not target.exists():
            tmp = target.with_suffix(".webp.tmp")
            tmp.write_bytes(data)
            os.replace(tmp, target)
        elif sha(target.read_bytes()) != sha(data):
            raise ValueError(f"{ident}: existing asset differs from validated cache")
    snapshot["records"].extend(new_records)
    snapshot["records"] = [existing.get(row["id"], row) for row in snapshot["records"]]
    snapshot["provenance"].extend(new_provenance)
    snapshot["selected"].extend(new_selected)
    manifest["images"].extend(new_images)
    def atomic_json(path: Path, obj: dict) -> None:
        fd, tmp_name = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                json.dump(obj, stream, ensure_ascii=False, indent=2)
                stream.write("\n")
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(tmp_name, path)
        finally:
            if os.path.exists(tmp_name):
                os.unlink(tmp_name)
    atomic_json(snapshot_path, snapshot)
    atomic_json(manifest_path, manifest)
    print(json.dumps({"status": "complete", "new_records": len(new_records), "new_provenance": len(new_provenance),
                      "new_manifest_images": len(new_images), "selected_added": new_selected,
                      "retrievedUTC": RETRIEVED_UTC, "cache": str(CACHE)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"ERROR: {type(error).__name__}: {error}", file=sys.stderr)
        raise
