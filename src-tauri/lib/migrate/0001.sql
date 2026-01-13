-- 片段元数据
CREATE TABLE snippet_meta
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    name       TEXT    NOT NULL
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
    created_at INTEGER NOT NULL DEFAULT 0,

    snippet_id TEXT,
    tag_id     TEXT,
    PRIMARY KEY (snippet_id, tag_id),
    FOREIGN KEY (snippet_id) REFERENCES snippet_meta (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES snippet_tag (id) ON DELETE CASCADE
);

-- snippet 内容表
CREATE TABLE snippet_content
(
    id       TEXT PRIMARY KEY,

    language TEXT NOT NULL, -- 语言名称
    content  TEXT NOT NULL, -- 内容
    FOREIGN KEY (id) REFERENCES snippet_meta (id) ON DELETE CASCADE
);

-- 发版项目（ReleaseProject）
CREATE TABLE release_project
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    name       TEXT    NOT NULL,
    `desc`     TEXT    NOT NULL
);

CREATE UNIQUE INDEX idx_release_project_name_uindex ON release_project (name);

-- 版本表（ReleaseVersion）
CREATE TABLE release_version
(
    id           TEXT PRIMARY KEY,
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL,

    project_id   TEXT    NOT NULL,
    version      TEXT    NOT NULL,
    publish_time INTEGER NOT NULL,
    publish_user TEXT    NOT NULL,
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_version_project_id ON release_version (project_id);
CREATE UNIQUE INDEX idx_release_version_project_id_version_uindex ON release_version (project_id, version);
CREATE INDEX idx_release_version_project_id_deploy_time ON release_version (project_id, publish_time);

-- 版本日志（ReleaseVersionLog）
CREATE TABLE release_version_log
(
    id         TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    content    TEXT NOT NULL,
    FOREIGN KEY (id) REFERENCES release_version (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_version_log_project_id ON release_version_log (project_id);

-- 部署实例（ReleaseInstance）
CREATE TABLE release_instance
(
    id                 TEXT PRIMARY KEY,
    created_at         INTEGER NOT NULL,
    updated_at         INTEGER NOT NULL,

    project_id         TEXT    NOT NULL,
    name               TEXT    NOT NULL,
    `desc`             TEXT    NOT NULL,
    current_version_id TEXT,
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_instance_project_id ON release_instance (project_id);
CREATE UNIQUE INDEX idx_release_instance_project_id_name_uindex ON release_instance (project_id, name);
CREATE INDEX idx_release_instance_current_version_id ON release_instance (current_version_id);

-- 发版部署记录（ReleaseDeploy）
CREATE TABLE release_deploy
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,

    project_id  TEXT    NOT NULL,
    version_id  TEXT    NOT NULL,
    instance_id TEXT    NOT NULL,

    deploy_time INTEGER NOT NULL,
    deploy_user TEXT    NOT NULL,

    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES release_version (id) ON DELETE CASCADE,
    FOREIGN KEY (instance_id) REFERENCES release_instance (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_deploy_project_id ON release_deploy (project_id);
CREATE INDEX idx_release_deploy_version_id ON release_deploy (version_id);
CREATE INDEX idx_release_deploy_instance_id ON release_deploy (instance_id);
CREATE UNIQUE INDEX idx_release_deploy_instance_id_version_id_uindex ON release_deploy (instance_id, version_id);

-- 发版资产元数据（ReleaseAssetMeta）
CREATE TABLE release_asset_meta
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL,

    project_id    TEXT    NOT NULL,
    scope         TEXT    NOT NULL CHECK ( scope IN ('version', 'instance') ),
    scope_id      TEXT    NOT NULL,
    relative_path TEXT    NOT NULL,
    file_name     TEXT    NOT NULL,
    file_type     TEXT    NOT NULL CHECK ( file_type IN ('document', 'sql', 'other') ),
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_asset_meta_project_scope_scope_id
    ON release_asset_meta (project_id, scope, scope_id);
CREATE INDEX idx_release_asset_meta_project_file_type
    ON release_asset_meta (project_id, file_type);

-- 发版资产内容（ReleaseAssetContent）
CREATE TABLE release_asset_content
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    project_id TEXT    NOT NULL,
    language   TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_asset_content_project_id ON release_asset_content (project_id);
CREATE INDEX idx_release_asset_content_project_id_language ON release_asset_content (project_id, language);

-- AI 聊天分组（AiChatGroup）
CREATE TABLE ai_chat_group
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    name       TEXT    NOT NULL,
    prompt     TEXT    NOT NULL,
    model      TEXT    NOT NULL,
    sort       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_ai_chat_group_sort ON ai_chat_group (sort);

-- AI 聊天项（AiChatItem）
CREATE TABLE ai_chat_item
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    group_id   TEXT    NOT NULL DEFAULT '',
    name       TEXT    NOT NULL,
    top        INTEGER NOT NULL DEFAULT 0,
    sort       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_ai_chat_item_group_id ON ai_chat_item (group_id);
CREATE INDEX idx_ai_chat_item_top ON ai_chat_item (top);
CREATE INDEX idx_ai_chat_item_sort ON ai_chat_item (sort);

-- AI 聊天消息（AiChatMessage）
CREATE TABLE ai_chat_message
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    `index`    INTEGER NOT NULL,
    chat_id    TEXT    NOT NULL,
    role       TEXT    NOT NULL CHECK ( role IN ('system', 'user', 'assistant', 'model-change', 'error') ),
    thinking   TEXT    NOT NULL DEFAULT '',
    content    TEXT    NOT NULL,
    model      TEXT    NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES ai_chat_item (id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_chat_message_chat_id ON ai_chat_message (chat_id);
CREATE INDEX idx_ai_chat_message_chat_id_index ON ai_chat_message (chat_id, `index`);
CREATE INDEX idx_ai_chat_message_role ON ai_chat_message (role);
