CREATE TABLE memo_chunk
(
    -- 主键
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    -- 关联 memo
    memo_id    TEXT    NOT NULL DEFAULT '',

    -- 内容
    content    TEXT    NOT NULL DEFAULT ''
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_chunk_memo_id ON memo_chunk (memo_id);

CREATE TABLE memo_comment
(
    -- 主键
    id               TEXT PRIMARY KEY,
    created_at       INTEGER NOT NULL DEFAULT 0,
    updated_at       INTEGER NOT NULL DEFAULT 0,

    -- 关联 memo
    memo_id          TEXT    NOT NULL DEFAULT '',

    -- 朋友ID，为空代表是我自己的回复
    friend_id        TEXT    NOT NULL DEFAULT '',

    -- 内容
    content          TEXT    NOT NULL DEFAULT '',

    -- 0 - 一级评论，大于 0 - 二级回复
    parent_id        TEXT    NOT NULL DEFAULT '',

    -- 标记是否由 @ 触发（用于统计/展示）
    is_mention_reply TEXT    NOT NULL DEFAULT 'no'
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_comment_memo_id ON memo_comment (memo_id);
CREATE INDEX idx_memo_comment_friend_id ON memo_comment (friend_id);
CREATE INDEX idx_memo_comment_parent_id ON memo_comment (parent_id);

CREATE TABLE memo_friend
(
    -- 主键
    id                      TEXT PRIMARY KEY,
    created_at              INTEGER NOT NULL DEFAULT 0,
    updated_at              INTEGER NOT NULL DEFAULT 0,

    -- 头像
    avatar                  TEXT    NOT NULL DEFAULT '',
    -- 模型
    model                   TEXT    NOT NULL DEFAULT '',

    -- ===== 基础人设层（静态，创建时设定） =====

    -- 名称
    name                    TEXT    NOT NULL DEFAULT '',
    -- 昵称
    preferred_name          TEXT    NOT NULL DEFAULT '',
    -- 性别
    gender                  TEXT    NOT NULL DEFAULT 'unknown',
    -- 心里年龄
    age_range               TEXT    NOT NULL DEFAULT 'young',
    -- 具体年龄，可选
    age_exact               INTEGER NOT NULL DEFAULT 0,

    -- ===== 三维身份定位 =====

    -- 职业/身份（如"心理咨询师"、"同龄程序员"、"咖啡师"）
    occupation              TEXT    NOT NULL DEFAULT '',

    -- 与用户的关系
    relation                TEXT    NOT NULL DEFAULT 'friend',

    -- 荣格原型
    archetype               TEXT    NOT NULL DEFAULT 'everyman',

    -- ===== 人格描述（供LLM使用的自然语言） =====

    -- 详细Prompt（如"你是一个有点毒舌但内心温柔的咖啡师..."）
    personality_prompt      TEXT    NOT NULL DEFAULT '',

    -- 标签（JSON数组：["幽默","毒舌","治愈"]）
    personality_tags        TEXT    NOT NULL DEFAULT '',

    -- 语言风格说明
    speaking_style          TEXT    NOT NULL DEFAULT '',

    -- 背景故事（增加真实感）
    background_story        TEXT    NOT NULL DEFAULT '',

    -- ===== 知识域与局限（防止AI越界） =====

    -- 知识域（JSON：{"domains":["职场","心理学"],"blindspots":["医学诊断"]}）
    knowledge_scope         TEXT    NOT NULL DEFAULT '',

    -- 禁忌话题（JSON：["政治","给出医疗建议"]）
    taboo_topics            TEXT    NOT NULL DEFAULT '',

    -- ===== 记忆与认知参数 =====

    -- 记忆跨度（影响注入多少历史memo）
    memory_span             TEXT    NOT NULL DEFAULT 'medium',

    -- 共情能力（影响回应情感浓度）
    emotional_depth         INTEGER NOT NULL DEFAULT 5,

    -- 主动性（影响发朋友圈频率）
    proactivity_level       INTEGER NOT NULL DEFAULT 5,

    -- 对话策略
    conversation_strategy   TEXT    NOT NULL DEFAULT '',

    -- ===== 动态关系层（随互动变化） =====

    -- 亲密度（解锁更多互动）
    intimacy_score          INTEGER NOT NULL DEFAULT 0,

    -- 信任度（知道多少秘密）
    trust_level             INTEGER NOT NULL DEFAULT 0,

    -- 对话次数
    interaction_count       INTEGER NOT NULL DEFAULT 0,

    -- 上次互动时间
    last_interaction        INTEGER NOT NULL DEFAULT 0,

    -- 互动频率特征
    conversation_frequency  TEXT    NOT NULL DEFAULT '',

    -- 关系里程碑（JSON记录关键事件）
    relationship_milestones TEXT    NOT NULL DEFAULT '',

    -- ===== 已知信息边界（隐私控制） =====

    -- 已知memo分类（JSON：["work","family"]，为空表示全知道）
    known_memo_categories   TEXT    NOT NULL DEFAULT '',

    -- 被排除在外的memo数量（用于"吃醋"逻辑）
    unknown_memo_count      INTEGER NOT NULL DEFAULT 0,

    -- ===== 情绪状态（AI也有情绪！） =====

    -- 当前情绪
    current_mood            TEXT    NOT NULL DEFAULT 'happy',

    -- 情绪持续时间（AI也会"第二天心情不好"）
    mood_expires_at         INTEGER NOT NULL DEFAULT 0,

    -- ===== 朋友圈行为配置 =====

    -- 发圈风格
    posting_style           TEXT    NOT NULL DEFAULT 'encouraging',

    -- 特定关键词触发（JSON数组）
    trigger_keywords        TEXT    NOT NULL DEFAULT '',

    -- 活跃时间段（防止深夜发圈打扰）
    active_hours            TEXT    NOT NULL DEFAULT '',

    -- ===== 状态管理 =====

    -- 是否启用
    is_active               INTEGER NOT NULL DEFAULT 1,

    -- 是否未解锁（需达成条件）
    is_locked               INTEGER NOT NULL DEFAULT 0,

    -- 解锁条件JSON
    unlock_condition        TEXT    NOT NULL DEFAULT '',

    -- 展示顺序
    sort_order              INTEGER NOT NULL DEFAULT 0,

    -- 人设版本（后期可升级）
    version                 INTEGER NOT NULL DEFAULT 1,
    posting_triggers        text             default '["keyword"]' not null,
    autopost_interval_hours integer          default 72 not null,
    last_autopost_at        integer          default 0 not null,
    state_trigger_condition text             default '' not null,
    max_posts_per_week      integer          default 3 not null
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_friend_is_active ON memo_friend (is_active);
CREATE INDEX idx_memo_friend_sort_order ON memo_friend (sort_order);
CREATE INDEX idx_memo_friend_last_interaction ON memo_friend (last_interaction);

CREATE TABLE memo_item
(
    -- 主键
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    -- 类型，分为普通/备忘/隐私
    type       TEXT    NOT NULL DEFAULT 'normal',

    -- 是否已被消费，当类型是普通的时候，此字段有效
    consumed   TEXT    NOT NULL DEFAULT 'no',

    -- 朋友ID，多个以逗号分隔，memo 是可以 @ 指定好友的
    friend_ids TEXT    NOT NULL DEFAULT ''
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_item_type ON memo_item (type);
CREATE INDEX idx_memo_item_consumed ON memo_item (consumed);

CREATE TABLE memo_layer_behavior
(
    -- 主键
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    -- 来源
    source     TEXT    NOT NULL DEFAULT 'memo',

    -- memo 或者 chat_session
    source_id  TEXT    NOT NULL DEFAULT '',

    -- 类型
    type       TEXT    NOT NULL DEFAULT 'todo',

    -- 具体的行为描述
    behavior   TEXT    NOT NULL DEFAULT '',

    -- 0~9
    priority   INTEGER NOT NULL DEFAULT 5,

    -- 状态
    status     TEXT    NOT NULL DEFAULT 'active',

    -- 如果有明确的截止日期
    deadline   INTEGER NOT NULL DEFAULT 0,

    -- 提醒时间
    reminder   INTEGER NOT NULL DEFAULT 0,

    -- 有效期
    expire_at  INTEGER NOT NULL DEFAULT 0
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_layer_behavior_source ON memo_layer_behavior (source, source_id);
CREATE INDEX idx_memo_layer_behavior_status ON memo_layer_behavior (status);
CREATE INDEX idx_memo_layer_behavior_expire_at ON memo_layer_behavior (expire_at);

CREATE TABLE memo_layer_cognitive
(
    -- 主键
    id                   TEXT PRIMARY KEY,
    created_at           INTEGER NOT NULL DEFAULT 0,
    updated_at           INTEGER NOT NULL DEFAULT 0,

    -- 来源
    source               TEXT    NOT NULL DEFAULT 'memo',

    -- memo 或者 chat_session
    source_id            TEXT    NOT NULL DEFAULT '',

    -- 核心话题（如"职场公平"）
    topic                TEXT    NOT NULL DEFAULT '',

    -- 类型
    type                 TEXT    NOT NULL DEFAULT 'unsolved_problem',

    -- 重要性 0～9
    importance           INTEGER NOT NULL DEFAULT 5,

    -- 认知扭曲类型（如"灾难化"、"读心术"）
    cognitive_distortion TEXT    NOT NULL DEFAULT '',

    -- 有效期
    expire_at            INTEGER NOT NULL DEFAULT 0
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_layer_cognitive_source ON memo_layer_cognitive (source, source_id);
CREATE INDEX idx_memo_layer_cognitive_expire_at ON memo_layer_cognitive (expire_at);

CREATE TABLE memo_layer_emotion
(
    -- 主键
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT 0,

    -- 来源
    source        TEXT    NOT NULL DEFAULT 'memo',

    -- memo 或者 chat_session
    source_id     TEXT    NOT NULL DEFAULT '',

    -- 情绪类型
    emotion_type  TEXT    NOT NULL DEFAULT 'neutral',

    -- 强度，0~9
    intensity     INTEGER NOT NULL DEFAULT 5,

    -- 触发给情绪的话题
    trigger_topic TEXT    NOT NULL DEFAULT '',

    -- 有效期
    expire_at     INTEGER NOT NULL DEFAULT 0
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_layer_emotion_source ON memo_layer_emotion (source, source_id);
CREATE INDEX idx_memo_layer_emotion_expire_at ON memo_layer_emotion (expire_at);

CREATE TABLE memo_layer_persona
(
    -- 主键
    id               TEXT PRIMARY KEY,
    created_at       INTEGER NOT NULL DEFAULT 0,
    updated_at       INTEGER NOT NULL DEFAULT 0,

    -- 来源
    source           TEXT    NOT NULL DEFAULT 'memo',

    -- memo 或者 chat_session
    source_id        TEXT    NOT NULL DEFAULT '',

    -- 特征名称
    trait_name       TEXT    NOT NULL DEFAULT 'openness',

    -- 单位变化量，0～99
    delta            INTEGER NOT NULL DEFAULT 0,

    -- 用户该特质的基线水平（由多次_memo_累积得出）
    baseline_trait   INTEGER NOT NULL DEFAULT 50,

    -- 模型对此判断的置信度，0～99
    confidence       INTEGER NOT NULL DEFAULT 50,

    -- 证据原文片段（生成explanation用），对此字段存疑
    evidence_snippet TEXT    NOT NULL DEFAULT '',

    -- 有效期
    expire_at        INTEGER NOT NULL DEFAULT 0
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_layer_persona_source ON memo_layer_persona (source, source_id);
CREATE INDEX idx_memo_layer_persona_trait_name ON memo_layer_persona (trait_name);
CREATE INDEX idx_memo_layer_persona_expire_at ON memo_layer_persona (expire_at);

CREATE TABLE memo_session
(
    -- 主键
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    -- 和哪个人会话
    friend_id  TEXT    NOT NULL DEFAULT '',
    status     TEXT    NOT NULL DEFAULT 'chat'
);

-- 创建索引以加速查询
CREATE INDEX idx_memo_session_friend_id ON memo_session (friend_id);
CREATE INDEX idx_memo_session_created_at ON memo_session (created_at);

CREATE TABLE memo_message
(
    -- 主键
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    session_id TEXT    NOT NULL DEFAULT '',
    role       TEXT    NOT NULL DEFAULT '',
    content    TEXT    NOT NULL DEFAULT ''
);


CREATE INDEX idx_memo_message_session_id ON memo_message (session_id);

CREATE TABLE memo_session_summary
(
    -- 主键
    id           TEXT PRIMARY KEY,
    created_at   INTEGER NOT NULL DEFAULT 0,
    updated_at   INTEGER NOT NULL DEFAULT 0,
    session_id   TEXT    NOT NULL DEFAULT '',
    friend_id    TEXT    NOT NULL DEFAULT '',
    title        TEXT    NOT NULL DEFAULT '',
    summary      TEXT    NOT NULL DEFAULT '',
    key_insights TEXT    NOT NULL DEFAULT '',
    ai_journal   TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE memo_post
(
    id              TEXT PRIMARY KEY,
    created_at      INTEGER NOT NULL DEFAULT 0,
    updated_at      INTEGER NOT NULL DEFAULT 0,
    friend_id       TEXT    NOT NULL DEFAULT '',
    content         TEXT    NOT NULL DEFAULT '',
    media_urls      TEXT    NOT NULL DEFAULT '',
    location        TEXT    NOT NULL DEFAULT '',
    triggered_by    TEXT    NOT NULL DEFAULT '',
    trigger_keyword TEXT    NOT NULL DEFAULT '',
    is_like         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE memo_post_comment
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    post_id    TEXT    NOT NULL DEFAULT '',
    friend_id  TEXT    NOT NULL DEFAULT '',
    content    TEXT    NOT NULL DEFAULT ''
);