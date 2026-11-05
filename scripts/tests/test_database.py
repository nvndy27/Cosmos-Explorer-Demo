"""Database and HTTP API acceptance tests; standard library only."""

from __future__ import annotations

import json
import sqlite3
import sys
import tempfile
import threading
import unittest
from contextlib import closing
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

import build_database  # noqa: E402
import catalog_api  # noqa: E402


class DatabaseAndAPITest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.temp_dir = tempfile.TemporaryDirectory(prefix="cosmos-database-test-")
        cls.database = Path(cls.temp_dir.name) / "catalog.sqlite"
        cls.payload = build_database.export_runtime_catalog(ROOT)
        cls.counts = build_database.build_database(cls.payload, cls.database)
        cls.server = catalog_api.make_server(cls.database, "127.0.0.1", 0)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        host, port = cls.server.server_address
        cls.base_url = f"http://{host}:{port}"

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=3)
        cls.temp_dir.cleanup()

    def api(self, method: str, target: str, body: bytes | None = None):
        request = Request(self.base_url + target, data=body, method=method)
        try:
            response = urlopen(request, timeout=5)
        except HTTPError as error:
            response = error
        try:
            payload = response.read()
        finally:
            response.close()
        decoded = json.loads(payload) if payload else None
        return response.code, response.headers, payload, decoded

    def test_integrity_counts_and_foreign_key_constraints(self) -> None:
        with closing(sqlite3.connect(self.database)) as connection:
            connection.execute("PRAGMA foreign_keys = ON")
            self.assertEqual(connection.execute("PRAGMA foreign_keys").fetchone()[0], 1)
            self.assertEqual(connection.execute("PRAGMA user_version").fetchone()[0], 2)
            self.assertEqual(connection.execute("PRAGMA integrity_check").fetchone()[0], "ok")
            self.assertEqual(connection.execute("PRAGMA foreign_key_check").fetchall(), [])
            self.assertEqual(connection.execute("SELECT count(*) FROM objects").fetchone()[0], 164)
            self.assertEqual(connection.execute("SELECT count(*) FROM images").fetchone()[0], 152)
            self.assertEqual(connection.execute("SELECT count(*) FROM object_images").fetchone()[0], 152)
            self.assertEqual(connection.execute("SELECT count(*) FROM measurements").fetchone()[0], self.counts["measurements"])
            source_id = connection.execute("SELECT id FROM sources LIMIT 1").fetchone()[0]
            with self.assertRaises(sqlite3.IntegrityError):
                connection.execute(
                    "INSERT INTO object_sources(object_id, source_id, role, label, ordinal) VALUES (?, ?, ?, ?, ?)",
                    ("no-such-object", source_id, "reference", "invalid", 0),
                )
            with self.assertRaises(sqlite3.IntegrityError):
                connection.execute(
                    "INSERT INTO objects(id, name, level, type, raw_json) VALUES (?, ?, ?, ?, ?)",
                    ("earth", "Duplicate", "solar", "planet", "{}"),
                )

    def test_normalized_rows_and_raw_records_match_runtime_export(self) -> None:
        with closing(sqlite3.connect(self.database)) as connection:
            connection.row_factory = sqlite3.Row
            database_objects = {
                row["id"]: json.loads(row["raw_json"])
                for row in connection.execute("SELECT id, raw_json FROM objects")
            }
            self.assertEqual(set(database_objects), {record["id"] for record in self.payload["objects"]})
            for record in self.payload["objects"]:
                object_id = record["id"]
                self.assertEqual(database_objects[object_id], record)
                normalized = {
                    row["metric_key"]: json.loads(row["raw_json"])
                    for row in connection.execute(
                        "SELECT metric_key, raw_json FROM measurements WHERE object_id = ?", (object_id,)
                    )
                }
                self.assertEqual(normalized, record.get("measurements") or {})
                aliases = [row[0] for row in connection.execute(
                    "SELECT alias FROM object_aliases WHERE object_id = ? ORDER BY ordinal", (object_id,)
                )]
                expected_aliases = record.get("aliases") or []
                if isinstance(expected_aliases, str):
                    expected_aliases = [expected_aliases]
                expected_aliases = list(dict.fromkeys(alias.strip() for alias in expected_aliases if isinstance(alias, str) and alias.strip()))
                self.assertEqual(aliases, expected_aliases)
                relations = connection.execute(
                    """SELECT os.role, os.label, os.ordinal, s.url
                       FROM object_sources AS os JOIN sources AS s ON s.id = os.source_id
                       WHERE os.object_id = ?""",
                    (object_id,),
                ).fetchall()
                expected_sources = sorted(build_database.source_associations(record))
                actual_sources = sorted((row["role"], row["label"], row["url"], row["ordinal"]) for row in relations)
                self.assertEqual(actual_sources, expected_sources)

            manifest_images = {image["id"]: image for image in self.payload["images"]}
            image_rows = {
                row["id"]: json.loads(row["raw_json"])
                for row in connection.execute("SELECT id, raw_json FROM images")
            }
            self.assertEqual(image_rows, manifest_images)
            for image_id, image in manifest_images.items():
                relation = connection.execute(
                    "SELECT image_id FROM object_images WHERE object_id = ?", (image_id,)
                ).fetchone()
                self.assertIsNotNone(relation)
                self.assertEqual(relation["image_id"], image_id)

    def test_api_pagination_search_and_type_filter(self) -> None:
        pages = [self.api("GET", "/api/objects?" + urlencode({"page": page, "page_size": 50}))[3] for page in range(1, 5)]
        self.assertEqual([page["total"] for page in pages], [164] * 4)
        ids = [item["id"] for page in pages for item in page["items"]]
        self.assertEqual(len(ids), 164)
        self.assertEqual(len(set(ids)), 164)
        self.assertEqual([len(page["items"]) for page in pages], [50, 50, 50, 14])
        self.assertIsNone(pages[3]["next_page"])

        search = self.api("GET", "/api/objects?" + urlencode({"q": "earth", "page_size": 100}))[3]
        self.assertIn("earth", {item["id"] for item in search["items"]})
        object_type = self.payload["objects"][0]["type"]
        filtered = self.api("GET", "/api/objects?" + urlencode({"type": object_type, "page_size": 100}))[3]
        self.assertEqual(filtered["total"], sum(record["type"] == object_type for record in self.payload["objects"]))
        self.assertTrue(all(item["type"] == object_type for item in filtered["items"]))

        status, headers, body, data = self.api("GET", "/api/objects?page_size=101")
        self.assertEqual(status, 400)
        self.assertIn("application/json", headers.get_content_type())
        self.assertEqual(data["error"]["status"], 400)
        self.assertEqual(json.loads(body), data)

    def test_api_detail_head_method_and_read_only_contract(self) -> None:
        status, headers, _, detail = self.api("GET", "/api/objects/earth")
        self.assertEqual(status, 200)
        self.assertEqual(headers.get_content_type(), "application/json")
        expected = next(record for record in self.payload["objects"] if record["id"] == "earth")
        self.assertEqual(detail["record"], expected)
        self.assertIn("radius", detail["measurements"])
        self.assertTrue(detail["sources"])
        self.assertTrue(detail["images"])

        head_status, head_headers, head_body, _ = self.api("HEAD", "/api/objects/earth")
        self.assertEqual(head_status, 200)
        self.assertEqual(head_body, b"")
        self.assertEqual(head_headers["Content-Length"], str(len(json.dumps(detail, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))))

        post_status, post_headers, _, post_data = self.api("POST", "/api/objects", b"{}")
        self.assertEqual(post_status, 405)
        self.assertEqual(post_headers.get_content_type(), "application/json")
        self.assertEqual(post_data["error"]["status"], 405)
        self.assertEqual(post_headers.get("Allow"), "GET, HEAD")

        unknown_status, unknown_headers, _, unknown_data = self.api("BREW", "/api/objects")
        self.assertEqual(unknown_status, 405)
        self.assertEqual(unknown_headers.get_content_type(), "application/json")
        self.assertEqual(unknown_headers.get("Allow"), "GET, HEAD")
        self.assertEqual(unknown_data["error"]["status"], 405)

        connection = catalog_api.readonly_connection(self.database)
        try:
            with self.assertRaises(sqlite3.OperationalError):
                connection.execute("DELETE FROM objects")
        finally:
            connection.close()

    def test_api_rejects_traversal_and_treats_sql_injection_as_data(self) -> None:
        for target in ("/api/objects/%2e%2e%2fsecret", "/api/objects/%27%20OR%201%3D1--"):
            status, headers, body, decoded = self.api("GET", target)
            self.assertEqual(status, 400, target)
            self.assertEqual(headers.get_content_type(), "application/json")
            self.assertEqual(json.loads(body), decoded)

        injected_type = quote("planet' OR 1=1--", safe="")
        status, _, _, result = self.api("GET", f"/api/objects?type={injected_type}")
        self.assertEqual(status, 200)
        self.assertEqual(result["total"], 0)
        self.assertEqual(self.api("GET", "/api/objects?page_size=100")[3]["total"], 164)

    def test_rebuild_is_deterministic_and_failure_preserves_previous_database(self) -> None:
        previous = self.database.read_bytes()
        rebuilt = Path(self.temp_dir.name) / "rebuilt.sqlite"
        build_database.build_database(self.payload, rebuilt)
        self.assertEqual(rebuilt.read_bytes(), previous)
        invalid = dict(self.payload, objects=[*self.payload["objects"], self.payload["objects"][0]])
        with self.assertRaises(ValueError):
            build_database.build_database(invalid, self.database)
        self.assertEqual(self.database.read_bytes(), previous)
        self.assertEqual(list(self.database.parent.glob(".catalog.sqlite.*.tmp")), [])

    def test_typed_measurements_and_sources_preserve_the_scientific_contract(self) -> None:
        with sqlite3.connect(self.database) as connection:
            connection.row_factory = sqlite3.Row
            for record in self.payload["objects"]:
                rows = connection.execute(
                    "SELECT m.*, s.url AS source_url FROM measurements m LEFT JOIN sources s ON s.id=m.source_id WHERE object_id=?",
                    (record["id"],),
                ).fetchall()
                for row in rows:
                    expected = record["measurements"][row["metric_key"]]
                    if expected is None:
                        for field in ("value", "unit", "definition", "source_url", "comparable"):
                            self.assertIsNone(row[field])
                        continue
                    value = expected.get("value")
                    self.assertEqual(row["value"], None if value is None else float(value))
                    self.assertEqual(row["unit"], expected.get("unit"))
                    self.assertEqual(row["definition"], expected.get("definition"))
                    self.assertEqual(row["source_url"], expected.get("source"))
                    self.assertEqual(row["comparable"], expected.get("comparable"))

    def test_output_path_cannot_overwrite_source_or_escape_worktree(self) -> None:
        for requested in ("README.md", "cosmos-explorer/index.html", "../outside.sqlite", "/tmp/outside.sqlite"):
            with self.subTest(requested=requested), self.assertRaises(ValueError):
                build_database.output_path(ROOT, requested)
        self.assertEqual(build_database.output_path(ROOT, ".automation/catalog.sqlite"), ROOT / ".automation/catalog.sqlite")

    def test_server_refuses_non_loopback_host(self) -> None:
        with self.assertRaises(ValueError):
            catalog_api.make_server(self.database, "0.0.0.0", 0)


if __name__ == "__main__":
    unittest.main()
