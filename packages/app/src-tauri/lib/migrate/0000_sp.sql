CREATE TABLE screenplay
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    title      TEXT    NOT NULL DEFAULT '',
    background TEXT    NOT NULL DEFAULT '',
    tags       TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX idx_screenplay_created_at ON screenplay (created_at);
CREATE INDEX idx_screenplay_updated_at ON screenplay (updated_at);

CREATE TABLE sp_scene
(
    id                     TEXT PRIMARY KEY,
    created_at             INTEGER NOT NULL DEFAULT 0,
    updated_at             INTEGER NOT NULL DEFAULT 0,
    screenplay_id          TEXT    NOT NULL DEFAULT '',
    `name`                 TEXT    NOT NULL DEFAULT '',
    `description`          TEXT    NOT NULL DEFAULT '',
    order_index            INTEGER NOT NULL DEFAULT 0,
    `narrative_goal`       TEXT    NOT NULL DEFAULT '',
    `key_clues`            TEXT    NOT NULL DEFAULT '',
    `required_revelations` TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX idx_sp_scene_screenplay_id ON sp_scene (screenplay_id);
CREATE INDEX idx_sp_scene_order ON sp_scene (`order_index`);

CREATE TABLE sp_role
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT 0,
    screenplay_id TEXT    NOT NULL DEFAULT '',
    `type`        TEXT    NOT NULL DEFAULT '', --- 角色类型
    `name`        TEXT    NOT NULL DEFAULT '',
    `identity`    TEXT    NOT NULL DEFAULT '',
    secret_info   TEXT    NOT NULL DEFAULT '',
    personality   TEXT    NOT NULL DEFAULT '',
    model         TEXT    NOT NULL DEFAULT ''  -- 使用的模型
);

CREATE INDEX idx_sp_role_screenplay_id ON sp_role (screenplay_id);
CREATE INDEX idx_sp_role_in_narrator ON sp_role (screenplay_id, type);

CREATE TABLE sp_dialogue
(
    id                      TEXT PRIMARY KEY,
    created_at              INTEGER NOT NULL DEFAULT 0,
    updated_at              INTEGER NOT NULL DEFAULT 0,
    screenplay_id           TEXT    NOT NULL DEFAULT '',
    scene_id                TEXT    NOT NULL DEFAULT '',
    turn_order              INTEGER NOT NULL DEFAULT 0,
    `type`                  TEXT    NOT NULL DEFAULT '',
    role_id                 TEXT    NOT NULL DEFAULT '',
    `action`                TEXT    NOT NULL DEFAULT '',
    dialogue                TEXT    NOT NULL DEFAULT '',
    director_instruction_id TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX idx_sp_dialogue_screenplay_id ON sp_dialogue (screenplay_id);
CREATE INDEX idx_sp_dialogue_scene_id ON sp_dialogue (scene_id);
CREATE INDEX idx_sp_dialogue_turn_order ON sp_dialogue (turn_order);
CREATE INDEX idx_sp_dialogue_type ON sp_dialogue (type);
CREATE INDEX idx_sp_dialogue_role_id ON sp_dialogue (role_id);

CREATE TABLE sp_initiative_log
(
    id          TEXT PRIMARY KEY DEFAULT '',
    created_at  INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL DEFAULT 0,
    dialogue_id TEXT    NOT NULL DEFAULT '',
    role_id     TEXT    NOT NULL DEFAULT '',
    score       INTEGER NOT NULL DEFAULT 0,
    factors     TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX idx_sp_initiative_log_dialogue_id ON sp_initiative_log (dialogue_id);
CREATE INDEX idx_sp_initiative_log_role_id ON sp_initiative_log (role_id);
CREATE INDEX idx_sp_initiative_log_score ON sp_initiative_log (score);

CREATE TABLE sp_role_belief
(
    id                 TEXT PRIMARY KEY,
    created_at         INTEGER NOT NULL,
    updated_at         INTEGER NOT NULL,
    screenplay_id      TEXT    NOT NULL,
    role_id            TEXT    NOT NULL,
    content            TEXT    NOT NULL,
    confidence         INTEGER NOT NULL,
    source_dialogue_id INTEGER NOT NULL,
    is_active          INTEGER NOT NULL
);

CREATE INDEX idx_sp_role_belief_screenplay_id ON sp_role_belief (screenplay_id);
CREATE INDEX idx_sp_role_belief_role_id ON sp_role_belief (role_id);
CREATE INDEX idx_sp_role_belief_is_active ON sp_role_belief (is_active);
CREATE INDEX idx_sp_role_belief_source_dialogue_id ON sp_role_belief (source_dialogue_id);

CREATE TABLE sp_role_emotion
(
    id            TEXT PRIMARY KEY DEFAULT '',
    created_at    INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT 0,
    screenplay_id TEXT    NOT NULL DEFAULT '',
    role_id       TEXT    NOT NULL DEFAULT '',
    emotion_type  TEXT    NOT NULL DEFAULT '',
    intensity     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_sp_role_emotion_screenplay_id ON sp_role_emotion (screenplay_id);
CREATE INDEX idx_sp_role_emotion_role_id ON sp_role_emotion (role_id);
CREATE INDEX idx_sp_role_emotion_emotion_type ON sp_role_emotion (emotion_type);

CREATE TABLE sp_role_latent_clue
(
    id                 TEXT PRIMARY KEY DEFAULT '',
    created_at         INTEGER NOT NULL DEFAULT 0,
    updated_at         INTEGER NOT NULL DEFAULT 0,
    screenplay_id      TEXT    NOT NULL DEFAULT '',
    role_id            TEXT    NOT NULL DEFAULT '',
    content            TEXT    NOT NULL DEFAULT '',
    source_dialogue_id INTEGER NOT NULL DEFAULT 0,
    scene_id           TEXT    NOT NULL DEFAULT '',
    status             TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX idx_sp_role_latent_clue_screenplay_id ON sp_role_latent_clue (screenplay_id);
CREATE INDEX idx_sp_role_latent_clue_role_id ON sp_role_latent_clue (role_id);
CREATE INDEX idx_sp_role_latent_clue_scene_id ON sp_role_latent_clue (scene_id);
CREATE INDEX idx_sp_role_latent_clue_status ON sp_role_latent_clue (status);
CREATE INDEX idx_sp_role_latent_clue_source_dialogue_id ON sp_role_latent_clue (source_dialogue_id);

CREATE TABLE sp_role_appearance
(
    id            INTEGER PRIMARY KEY,
    created_at    INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT 0,
    screenplay_id TEXT    NOT NULL DEFAULT '',
    role_id       TEXT    NOT NULL DEFAULT '',
    scene_id      TEXT    NOT NULL DEFAULT '',
    enter_turn    INTEGER NOT NULL DEFAULT 0, -- 进入场景的对话序号（可选）
    exit_turn     INTEGER NOT NULL DEFAULT 0, -- 离开场景的对话序号（可选）
    is_active     BOOLEAN NOT NULL DEFAULT 1, -- 当前是否在场景中（用于快速查询）
    FOREIGN KEY (role_id) REFERENCES sp_role (id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES sp_scene (id) ON DELETE CASCADE,
    UNIQUE (role_id, scene_id)                -- 同一角色在同一场景只记录一次
);

CREATE TABLE sp_director_instruction_log
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL DEFAULT 0,
    screenplay_id TEXT NOT NULL DEFAULT '',
    scene_id      TEXT NOT NULL DEFAULT '',
    instruction   TEXT NOT NULL DEFAULT '',
    params        TEXT NOT NULL DEFAULT '',
    dialogue_id   TEXT NOT NULL DEFAULT '',
    is_active     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_sp_director_instruction_log_screenplay_id ON sp_director_instruction_log (screenplay_id);
CREATE INDEX idx_sp_director_instruction_log_scene_id ON sp_director_instruction_log (scene_id);


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


