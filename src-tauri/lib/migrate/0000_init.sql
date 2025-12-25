-- 订阅源（对应 SubscribeItem）
CREATE TABLE IF NOT EXISTS subscribe_item
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,           -- Unix 毫秒时间戳（与 JS Date.now() 一致）
    updated_at INTEGER NOT NULL,

    url        TEXT    NOT NULL,
    icon       TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    folder     TEXT    NOT NULL,
    count      INTEGER NOT NULL DEFAULT 0, -- 资讯数量
    sequence   INTEGER NOT NULL DEFAULT 0  -- 排序
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
    isRead          BOOLEAN NOT NULL DEFAULT 0, -- SQLite 用 0/1 表示布尔
    content_fetched BOOLEAN NOT NULL DEFAULT 0
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