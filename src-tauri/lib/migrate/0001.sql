-- 片段元数据
CREATE TABLE snippet_meta
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    name      TEXT    NOT NULL
);

-- 标签主表（只存名称，不存计数）
CREATE TABLE snippet_tag
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER     NOT NULL DEFAULT 0,
    updated_at INTEGER     NOT NULL DEFAULT 0,
    name       TEXT UNIQUE NOT NULL
);

-- 多对多关系
CREATE TABLE snippet_tags
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER     NOT NULL DEFAULT 0,

    snippet_id TEXT,
    tag_id     TEXT,
    PRIMARY KEY (snippet_id, tag_id),
    FOREIGN KEY (snippet_id) REFERENCES snippet_meta (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES snippet_tag (id) ON DELETE CASCADE
);

-- snippet 内容表
CREATE TABLE snippet_content
(
    id         TEXT PRIMARY KEY,

    language   TEXT    NOT NULL, -- 语言名称
    content    TEXT    NOT NULL, -- 内容
    FOREIGN KEY (id) REFERENCES snippet_meta (id) ON DELETE CASCADE
);