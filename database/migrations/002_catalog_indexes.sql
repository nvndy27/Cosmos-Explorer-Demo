BEGIN IMMEDIATE;

CREATE INDEX objects_type_name_idx ON objects(type, name COLLATE NOCASE, id);
CREATE INDEX objects_level_name_idx ON objects(level, name COLLATE NOCASE, id);
CREATE INDEX objects_name_idx ON objects(name COLLATE NOCASE, id);
CREATE INDEX object_aliases_text_idx ON object_aliases(alias COLLATE NOCASE, object_id);
CREATE INDEX measurements_key_idx ON measurements(metric_key, object_id);
CREATE INDEX object_sources_source_idx ON object_sources(source_id, object_id);
CREATE INDEX images_source_idx ON images(source_id);

INSERT INTO schema_migrations(version, name) VALUES (2, '002_catalog_indexes');
PRAGMA user_version = 2;
COMMIT;
