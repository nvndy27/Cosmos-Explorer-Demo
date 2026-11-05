# Cosmos Explorer SQLite catalog read model

This optional SQLite database is a normalized, read-only view of the existing curated runtime catalog and image manifest. It does not replace `catalog.js` or `catalog-expanded.js`, and the browser does not call this API. The static application remains self-contained and continues to work from `file://` and offline.

## Build

From this worktree root, run:

```sh
python3 scripts/build_database.py
```

The builder runs `scripts/export_catalog.cjs` with Node.js. That exporter evaluates only the trusted local `catalog.js` and `catalog-expanded.js` scripts inside an isolated Node VM, then emits their 138 records and `data/image-manifest.json` as JSON. The Python builder invokes Node with an argument array and `shell=False`, applies `database/migrations/NNN_*.sql`, inserts sorted rows with parameterized SQL, checks foreign keys and SQLite integrity, and atomically replaces `.automation/catalog.sqlite`.

The default database path is ignored by Git. `--output` accepts another relative path within this worktree, for example `--output .automation/catalog-review.sqlite`. The generated database is a build artifact; do not commit it. SQL schema changes belong in a new, sequentially numbered migration. `PRAGMA user_version` and `schema_migrations` record the applied migration versions.

## Relational model

- `objects` contains searchable catalog fields and the complete `raw_json` runtime record. `object_aliases` stores each searchable alias as an ordered relation. API detail responses re-export the raw record without dropping fields.
- `measurements` stores one row per present measurement key, including explicit `NULL` values, unit, definition, source relation, limit/note/comparability fields and the complete measurement JSON.
- `sources` deduplicates source URLs. `object_sources` records each primary source, reference, paper, extra reference and statistic source with its label and order. Measurement and image source URLs also point to `sources`.
- `images` preserves each manifest entry and its complete raw JSON, including download URL, source URL, credit, classification, caption, retrieval date and SHA-256. `object_images` relates each image to the matching catalog object.

Foreign keys are enforced during builds and API connections. Schema checks reject empty identifiers, invalid JSON, invalid roles and duplicate relation keys. The model contains curated astronomical records and image provenance only. It has no accounts, favorites, user profiles or runtime PII, and the API does not write request data or log search terms.

## Optional local API

Build the database first, then run:

```sh
python3 scripts/catalog_api.py --db .automation/catalog.sqlite --host 127.0.0.1 --port 8000
```

The API accepts only a literal loopback IP address and serves GET/HEAD requests. It opens SQLite with `mode=ro` and `query_only=ON`. It exposes fixed JSON routes, never raw SQL input:

- `GET /api/objects?page=1&page_size=20` — bounded pagination (`page_size` 1–100), ordered by name and ID.
- `GET /api/objects?q=earth&type=planet&page=1&page_size=20` — optional literal search across ID, name, aliases and short label, plus exact runtime `type` filtering.
- `GET /api/objects/earth` — complete raw catalog record plus normalized sources, measurements and image manifest entry.
- `HEAD` on either route returns the corresponding JSON headers without a response body.

Invalid parameters, unsupported methods, traversal-like paths, invalid IDs and missing objects return JSON errors. Search and type values are bound SQL parameters; query terms are not interpreted as SQL. The API is an optional local read model, not a production service, hosted endpoint or authentication boundary. No claim is made that the frontend uses it.

## Tests

Run the database and API acceptance suite with the Python standard library:

```sh
python3 -m unittest discover -s scripts/tests -p 'test_database.py' -v
```

The suite builds a temporary database from the runtime sources and verifies record, measurement, source and image equivalence; foreign-key and integrity checks; bounded API pagination/search/type filters; detail and HEAD responses; method restrictions; traversal handling; and SQL injection treated as literal input.
