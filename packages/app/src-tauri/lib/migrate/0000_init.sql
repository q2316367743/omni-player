-- 订阅源（对应 SubscribeItem）
CREATE TABLE IF NOT EXISTS subscribe_item
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,           -- Unix 毫秒时间戳（与 JS Date.now() 一致）
    updated_at    INTEGER NOT NULL,

    url           TEXT    NOT NULL,
    icon          TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    folder        TEXT    NOT NULL,
    count         INTEGER NOT NULL DEFAULT 0, -- 资讯数量
    un_read_count INTEGER NOT NULL DEFAULT 0, -- 未读数量
    sequence      INTEGER NOT NULL DEFAULT 0  -- 排序
);

-- 新闻项（对应 FeedItem）
CREATE TABLE IF NOT EXISTS feed_item
(
    id              TEXT PRIMARY KEY,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL,

    subscribe_id    TEXT    NOT NULL,

    `signal`        TEXT    NOT NULL UNIQUE,    -- 全局唯一标识（如 GUID 或 link）
    title           TEXT    NOT NULL,
    link            TEXT    NOT NULL,
    pub_date        INTEGER NOT NULL,
    author          TEXT,
    summary         TEXT,
    is_read         INTEGER NOT NULL DEFAULT 0, -- SQLite 用 0/1 表示布尔
    content_fetched INTEGER NOT NULL DEFAULT 0
);

-- 为 feed_items 添加索引：加速按 signal 查询（关联内容时使用）
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_items_signal ON feed_item (signal);

-- 文章内容（对应 FeedContent）
CREATE TABLE IF NOT EXISTS feed_content
(
    id             TEXT PRIMARY KEY, -- 可与 feed_items.id 一致，或用 signal

    subscribe_id   TEXT    NOT NULL,
    feed_id        TEXT    NOT NULL,

    item_link      TEXT    NOT NULL, -- 对应 feed_items.signal 或 link
    html_content   TEXT,
    parsed_title   TEXT,
    parsed_content TEXT,
    fetch_time     TEXT    NOT NULL, -- ISO8601
    parse_success  BOOLEAN NOT NULL DEFAULT 0
);

-- 为 feed_contents 添加索引：通过 itemLink 快速查找内容
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_contents_itemlink ON feed_content (item_link);

CREATE TABLE analysis_session
(
    id               TEXT PRIMARY KEY,
    created_at       INTEGER NOT NULL,
    updated_at       INTEGER NOT NULL,

    filename         TEXT    NOT NULL, -- 原始文件名（如 "alipay_2025.csv"）
    source_type      TEXT,             -- 'bank', 'alipay', 'wechat' 等（可选）
    record_count     INTEGER,          -- 解析出的有效交易数
    date_range_start INTEGER,             -- 账单最早日期
    date_range_end   INTEGER              -- 账单最晚日期
);

CREATE TABLE `analysis_transaction`
(
    id           TEXT PRIMARY KEY,
    created_at   INTEGER                                    NOT NULL,
    updated_at   INTEGER                                    NOT NULL,

    session_id   TEXT                                       NOT NULL,
    -- 交易时间
    date         INTEGER                                    NOT NULL,
    -- 交易商品
    product      TEXT,
    -- 交易对方
    counterparty TEXT,
    -- 分类
    category     TEXT,
    --  交易类型，支出还是收入
    type         TEXT,
    -- 金额
    amount       INTEGER                                    NOT NULL,
    remark       TEXT,
    FOREIGN KEY (session_id) REFERENCES analysis_session (id) ON DELETE CASCADE
);

-- 1. 按会话快速定位（几乎所有查询都带 session_id）
CREATE INDEX idx_transactions_session_id ON analysis_transaction (session_id);

-- 2. 按会话+日期高效聚合（用于趋势图、日历视图）
CREATE INDEX idx_transactions_session_date ON analysis_transaction (session_id, date);

-- 3. 按会话+类型+类别高效分组（用于饼图、分类排行）
CREATE INDEX idx_transactions_session_type_category
    ON analysis_transaction (session_id, type, category);

CREATE TABLE analysis_category
(
    id           TEXT PRIMARY KEY,
    created_at   INTEGER                                    NOT NULL,

    session_id   TEXT                                       NOT NULL,

    name          TEXT    NOT NULL, -- 如 "餐饮", "交通"
    display_order INTEGER NOT NULL        -- 控制前端显示顺序
);

create unique index analysis_category_session_id_name_uindex
    on analysis_category (session_id, name);

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

    name       TEXT    NOT NULL DEFAULT '',
    prompt     TEXT    NOT NULL DEFAULT '',
    model      TEXT    NOT NULL DEFAULT '',
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
    name       TEXT    NOT NULL DEFAULT '',
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

    `index`    INTEGER NOT NULL DEFAULT 0,
    chat_id    TEXT    NOT NULL DEFAULT '',
    role       TEXT    NOT NULL CHECK ( role IN ('system', 'user', 'assistant', 'model-change', 'error') ),
    thinking   TEXT    NOT NULL DEFAULT '',
    content    TEXT    NOT NULL DEFAULT '',
    model      TEXT    NOT NULL DEFAULT '',
    think      INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (chat_id) REFERENCES ai_chat_item (id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_chat_message_chat_id ON ai_chat_message (chat_id);
CREATE INDEX idx_ai_chat_message_chat_id_index ON ai_chat_message (chat_id, `index`);
CREATE INDEX idx_ai_chat_message_role ON ai_chat_message (role);
