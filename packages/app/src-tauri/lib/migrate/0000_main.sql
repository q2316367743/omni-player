CREATE TABLE mcp_setting
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL DEFAULT 0,
    label       TEXT    NOT NULL DEFAULT '',
    name        TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    args        TEXT    NOT NULL DEFAULT '',
    command     TEXT    NOT NULL DEFAULT '',
    env         TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE plugin
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL DEFAULT 0,
    label       TEXT    NOT NULL DEFAULT '',
    icon        TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    platform    TEXT    NOT NULL DEFAULT '',
    type        TEXT    NOT NULL DEFAULT '',
    payload     TEXT    NOT NULL DEFAULT ''
);