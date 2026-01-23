CREATE TABLE sp_role_timeline
(
    -- 主键
    id                 TEXT PRIMARY KEY,
    created_at         INTEGER NOT NULL DEFAULT 0,
    updated_at         INTEGER NOT NULL DEFAULT 0,

    -- 关联角色
    screenplay_id      TEXT    NOT NULL DEFAULT '',
    role_id            TEXT    NOT NULL DEFAULT '',

    -- === 1. 物理时间轴（用于 AI 理解角色生平和排序） ===
    physical_age       INTEGER NOT NULL DEFAULT 0,      -- 年龄（核心排序依据）
    physical_year      INTEGER NOT NULL DEFAULT 0,      -- 具体年份（可选，用于历史文/修仙文）
    physical_month     INTEGER NOT NULL DEFAULT 0,      -- 具体月份（1-12，可选，用于同年龄排序）
    physical_day       INTEGER NOT NULL DEFAULT 0,      -- 具体日期（1-31，可选）
    precise_level      TEXT    NOT NULL DEFAULT 'year', -- 精度等级：'age'(仅年龄), 'year', 'month', 'day'

    -- === 2. 叙事关联（用于章节管理和回忆/插叙标记） ===
    related_chapter_id TEXT    NOT NULL DEFAULT '',     -- 关联章节ID（可选）
    related_scene_id   TEXT    NOT NULL DEFAULT '',     -- 关联场景ID（可选，更精细）
    relation_type      TEXT    NOT NULL DEFAULT 'none', -- 关系类型：'none'(无/背景), 'active'(发生), 'flashback'(回忆), 'foreshadow'(伏笔)

    -- === 3. 事件内容 ===
    event_type         TEXT    NOT NULL DEFAULT '',     -- 事件类型：'faction_change'(阵营), 'item_get'(物品), 'injury'(受伤), 'growth'(成长) 等
    title              TEXT    NOT NULL DEFAULT '',     -- 事件标题（如：拜师青云门）
    description        TEXT    NOT NULL DEFAULT '',     -- 详细描述（给 AI 看的上下文）
    tags               TEXT    NOT NULL DEFAULT '',     -- 标签（JSON字符串或逗号分隔，如："关键,主线"）

    -- === 4. 排序与元数据 ===
    sort_order         INTEGER          DEFAULT 0,      -- 手动排序权重（解决同年龄/同日期的微调）
    is_deleted         INTEGER          DEFAULT 0,      -- 软删除标记 (0:正常, 1:删除)

    -- 索引优化
    FOREIGN KEY (role_id) REFERENCES sp_role (id) ON DELETE CASCADE
);

-- 创建索引以加速查询
CREATE INDEX idx_timeline_role ON sp_role_timeline (role_id);
CREATE INDEX idx_timeline_physical_sort ON sp_role_timeline (role_id, physical_age, physical_month, physical_day, sort_order);
CREATE INDEX idx_timeline_chapter ON sp_role_timeline (related_chapter_id);

CREATE TABLE sp_chapter
(
    -- 主键
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT 0,

    -- 关联剧本
    screenplay_id TEXT    NOT NULL DEFAULT '',
    `index`       INTEGER NOT NULL DEFAULT 0,
    -- 章节信息
    title         TEXT    NOT NULL DEFAULT '',
    description   TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE sp_chapter_content
(
    -- 主键
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT 0,

    -- 关联剧本
    screenplay_id TEXT    NOT NULL DEFAULT '',
    chapter_id    TEXT    NOT NULL DEFAULT '',
    scene_id      TEXT    NOT NULL DEFAULT '',
    -- 内容
    content       TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX idx_sp_cc ON sp_chapter_content (screenplay_id, chapter_id);

-- 场景新增章节 ID
alter table sp_scene
    add chapter_id TEXT default '' not null;


