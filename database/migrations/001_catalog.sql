BEGIN IMMEDIATE;

CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY CHECK (version > 0),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE objects (
    id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    small TEXT,
    level TEXT NOT NULL CHECK (length(trim(level)) > 0),
    type TEXT NOT NULL CHECK (length(trim(type)) > 0),
    category TEXT,
    classification TEXT,
    system TEXT,
    summary TEXT,
    raw_json TEXT NOT NULL CHECK (json_valid(raw_json))
);

CREATE TABLE object_aliases (
    object_id TEXT NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    alias TEXT NOT NULL CHECK (length(trim(alias)) > 0),
    ordinal INTEGER NOT NULL CHECK (ordinal >= 0),
    PRIMARY KEY (object_id, ordinal),
    UNIQUE (object_id, alias)
);

CREATE TABLE sources (
    id INTEGER PRIMARY KEY,
    url TEXT NOT NULL UNIQUE CHECK (length(trim(url)) > 0),
    CHECK (instr(url, '://') > 0)
);

CREATE TABLE object_sources (
    object_id TEXT NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    role TEXT NOT NULL CHECK (role IN ('primary', 'reference', 'paper', 'extra_reference', 'stat')),
    label TEXT NOT NULL DEFAULT '',
    ordinal INTEGER NOT NULL CHECK (ordinal >= 0),
    PRIMARY KEY (object_id, role, ordinal)
);

CREATE TABLE measurements (
    object_id TEXT NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL CHECK (length(trim(metric_key)) > 0),
    value REAL,
    unit TEXT,
    definition TEXT,
    source_id INTEGER REFERENCES sources(id) ON DELETE RESTRICT,
    limit_value TEXT,
    note TEXT,
    comparable INTEGER CHECK (comparable IS NULL OR comparable IN (0, 1)),
    raw_json TEXT NOT NULL CHECK (json_valid(raw_json)),
    PRIMARY KEY (object_id, metric_key)
);

CREATE TABLE images (
    id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
    file_path TEXT NOT NULL UNIQUE CHECK (length(trim(file_path)) > 0),
    source_id INTEGER REFERENCES sources(id) ON DELETE RESTRICT,
    download_source_id INTEGER REFERENCES sources(id) ON DELETE RESTRICT,
    credit TEXT,
    classification TEXT,
    image_kind TEXT,
    caption TEXT,
    retrieved TEXT,
    sha256 TEXT NOT NULL CHECK (length(sha256) = 64 AND sha256 NOT GLOB '*[^0-9a-f]*'),
    raw_json TEXT NOT NULL CHECK (json_valid(raw_json))
);

CREATE TABLE object_images (
    object_id TEXT PRIMARY KEY REFERENCES objects(id) ON DELETE CASCADE,
    image_id TEXT NOT NULL UNIQUE REFERENCES images(id) ON DELETE RESTRICT
);

INSERT INTO schema_migrations(version, name) VALUES (1, '001_catalog');
PRAGMA user_version = 1;
COMMIT;
