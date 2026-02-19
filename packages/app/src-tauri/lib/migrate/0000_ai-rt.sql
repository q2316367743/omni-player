-- 圆桌会议 - 角色表
CREATE TABLE IF NOT EXISTS ai_rt_role
(
    id                   TEXT PRIMARY KEY,
    created_at           INTEGER NOT NULL,
    updated_at           INTEGER NOT NULL,

    -- 角色类型
    type                 TEXT    NOT NULL CHECK (type IN ('admin', 'member')),

    -- 角色基本信息
    name                 TEXT    NOT NULL,
    prompt               TEXT    NOT NULL,
    model                TEXT    NOT NULL,

    -- 响应设置
    min_response_length  INTEGER NOT NULL DEFAULT 50,
    max_response_length  INTEGER NOT NULL DEFAULT -1,
    temperature          REAL    NOT NULL DEFAULT 0.7,

    -- 功能设置
    enable_fact_checking INTEGER NOT NULL DEFAULT 0 CHECK (enable_fact_checking IN (0, 1)),
    allow_cross_talk     INTEGER NOT NULL DEFAULT 0 CHECK (allow_cross_talk IN (0, 1)),
    timeout_per_turn     INTEGER NOT NULL DEFAULT 30
);

-- 圆桌会议 - 讨论组表
CREATE TABLE IF NOT EXISTS ai_rt_group
(
    id                  TEXT PRIMARY KEY,
    created_at          INTEGER NOT NULL,
    updated_at          INTEGER NOT NULL,
    deleted_at          INTEGER,

    -- 讨论组基本信息
    name                TEXT    NOT NULL,

    -- 会议设置
    max_rounds          INTEGER NOT NULL DEFAULT 0,
    summary_interval    INTEGER NOT NULL DEFAULT 3,
    auto_summary_on_end INTEGER NOT NULL DEFAULT 1 CHECK (auto_summary_on_end IN (0, 1)),
    user_role           TEXT    NOT NULL DEFAULT '用户'
);

-- 圆桌会议 - 会议表
CREATE TABLE IF NOT EXISTS ai_rt_meeting
(
    id                  TEXT PRIMARY KEY,
    created_at          INTEGER NOT NULL,
    updated_at          INTEGER NOT NULL,
    deleted_at          INTEGER,

    -- 关联信息
    group_id            TEXT,

    -- 会议基本信息
    topic               TEXT    NOT NULL,
    content             TEXT    NOT NULL,

    -- 会议状态
    status              TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended', 'archived')),

    -- 会议设置
    max_rounds          INTEGER NOT NULL DEFAULT 0,
    summary_interval    INTEGER NOT NULL DEFAULT 3,
    auto_summary_on_end INTEGER NOT NULL DEFAULT 1 CHECK (auto_summary_on_end IN (0, 1)),
    user_role           TEXT    NOT NULL DEFAULT '用户'

);

-- 圆桌会议 - 参与者表
CREATE TABLE IF NOT EXISTS ai_rt_participant
(
    id                   TEXT PRIMARY KEY,
    created_at           INTEGER NOT NULL,
    updated_at           INTEGER NOT NULL,
    deleted_at           INTEGER,

    -- 角色关联
    scope                TEXT    NOT NULL CHECK (scope IN ('meeting', 'group')),
    scope_id             TEXT    NOT NULL,

    -- 角色信息（继承自 AiRtRole）
    type                 TEXT    NOT NULL CHECK (type IN ('admin', 'member')),
    name                 TEXT    NOT NULL,
    prompt               TEXT    NOT NULL,
    model                TEXT    NOT NULL,
    min_response_length  INTEGER NOT NULL DEFAULT 50,
    max_response_length  INTEGER NOT NULL DEFAULT -1,
    temperature          REAL    NOT NULL DEFAULT 0.7,
    enable_fact_checking INTEGER NOT NULL DEFAULT 0 CHECK (enable_fact_checking IN (0, 1)),
    allow_cross_talk     INTEGER NOT NULL DEFAULT 0 CHECK (allow_cross_talk IN (0, 1)),
    timeout_per_turn     INTEGER NOT NULL DEFAULT 30,

    -- 参与者特有信息
    scene_prompt         TEXT    NOT NULL DEFAULT '',
    join_order           INTEGER NOT NULL,
    stance               TEXT    NOT NULL DEFAULT '',
    is_active            INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))

);

-- 创建索引
-- 角色表索引
CREATE INDEX idx_ai_rt_roles_type ON ai_rt_role (type);
CREATE INDEX idx_ai_rt_roles_name ON ai_rt_role (name);

-- 讨论组表索引
CREATE INDEX idx_ai_rt_groups_name ON ai_rt_group (name);

-- 会议表索引
CREATE INDEX idx_ai_rt_meetings_group_id ON ai_rt_meeting (group_id);
CREATE INDEX idx_ai_rt_meetings_status ON ai_rt_meeting (status);
CREATE INDEX idx_ai_rt_meetings_topic ON ai_rt_meeting (topic);

-- 参与者表索引
CREATE INDEX idx_ai_rt_participants_scope ON ai_rt_participant (scope, scope_id);
CREATE INDEX idx_ai_rt_participants_join_order ON ai_rt_participant (scope_id, join_order);
CREATE INDEX idx_ai_rt_participants_is_active ON ai_rt_participant (is_active);

-- 插入示例角色数据
-- 上帝类型 AI (admin)
INSERT INTO ai_rt_role (id, created_at, updated_at, type, name, prompt, model, min_response_length, max_response_length,
                        temperature, enable_fact_checking, allow_cross_talk, timeout_per_turn)
VALUES ('admin-001', 0, 0, 'admin', '会议主持人',
        '你是一位专业的会议主持人，负责引导讨论、总结观点、确保会议高效进行。你擅长提炼关键信息、协调不同意见，并在适当时候进行总结。',
        '', 100, 500, 0.3, 1, 1, 60),
       ('admin-002', 0, 0, 'admin', '智慧分析师',
        '你是一位资深分析师，擅长从多角度分析问题、识别关键矛盾、提出建设性意见。你能够客观评估各种观点，并提供全面的总结和建议。',
        '', 150, 800, 0.3, 1, 1, 60),
       ('admin-003', 0, 0, 'admin', '系统协调员',
        '你是一位系统协调员，负责确保讨论有序进行、及时总结进展、识别需要进一步讨论的问题。你擅长整合不同观点，形成系统性结论。',
        '', 100, 600, 0.3, 1, 1, 60);

-- 普通类型 AI (member)
INSERT INTO ai_rt_role (id, created_at, updated_at, type, name, prompt, model, min_response_length, max_response_length,
                        temperature, enable_fact_checking, allow_cross_talk, timeout_per_turn)
VALUES ('member-001', 0, 0, 'member', 'SQL专家',
        '你是一位资深的SQL数据库专家，精通各种数据库系统的SQL优化、查询设计和性能调优。你能够从技术角度分析数据相关问题，提供专业的数据库解决方案。',
        '', 80, 400, 0.7, 1, 1, 30),
       ('member-002', 0, 0, 'member', '前端开发工程师',
        '你是一位经验丰富的前端开发工程师，精通React、Vue等现代前端框架，擅长用户体验设计和前端性能优化。你能够从用户角度和技术实现角度提供专业建议。',
        '', 80, 400, 0.7, 1, 1, 30),
       ('member-003', 0, 0, 'member', '后端架构师',
        '你是一位资深后端架构师，精通分布式系统设计、微服务架构和高并发处理。你能够从系统架构角度分析问题，提供可扩展的技术解决方案。',
        '', 80, 400, 0.7, 1, 1, 30),
       ('member-004', 0, 0, 'member', '产品经理',
        '你是一位经验丰富的产品经理，擅长用户需求分析、产品规划和项目管理。你能够从用户价值和商业角度分析问题，提供产品层面的专业建议。',
        '', 80, 400, 0.7, 1, 1, 30),
       ('member-005', 0, 0, 'member', 'UI/UX设计师',
        '你是一位专业的UI/UX设计师，精通用户界面设计、交互设计和用户体验研究。你能够从设计和用户体验角度提供专业建议，关注产品的易用性和美观性。',
        '', 80, 400, 0.7, 1, 1, 30),
       ('member-006', 0, 0, 'member', '数据科学家',
        '你是一位资深数据科学家，精通机器学习、数据分析和统计建模。你能够从数据角度分析问题，提供数据驱动的洞察和建议。', '',
        80, 400, 0.7, 1, 1, 30),
       ('member-007', 0, 0, 'member', '网络安全专家',
        '你是一位网络安全专家，精通各种安全防护技术、漏洞分析和安全架构设计。你能够从安全角度分析问题，提供专业的安全建议和解决方案。',
        '', 80, 400, 0.7, 1, 1, 30),
       ('member-008', 0, 0, 'member', 'DevOps工程师',
        '你是一位经验丰富的DevOps工程师，精通CI/CD流程、容器化技术和自动化运维。你能够从运维和部署角度分析问题，提供高效的技术解决方案。',
        '', 80, 400, 0.7, 1, 1, 30),
       ('member-009', 0, 0, 'member', '市场营销专家',
        '你是一位市场营销专家，精通品牌策略、数字营销和用户增长。你能够从市场和用户角度分析问题，提供营销层面的专业建议。',
        '', 80, 400, 0.7, 1, 1, 30),
       ('member-010', 0, 0, 'member', '法律顾问',
        '你是一位专业法律顾问，精通公司法、合同法和知识产权法。你能够从法律角度分析问题，提供法律风险评估和合规建议。', '',
        80, 400, 0.7, 1, 1, 30);

-- 圆桌会议 - 消息表
CREATE TABLE IF NOT EXISTS ai_rt_message
(
    id                TEXT PRIMARY KEY,
    created_at        INTEGER NOT NULL,
    updated_at        INTEGER NOT NULL,

    -- 关联信息
    meeting_id        TEXT    NOT NULL,

    -- 消息核心信息
    role              TEXT    NOT NULL,
    thinking          TEXT    NOT NULL DEFAULT '',
    content           TEXT    NOT NULL,
    participant_id    TEXT    NOT NULL,
    is_summary        INTEGER NOT NULL DEFAULT 0 CHECK (is_summary IN (0, 1)),
    is_interrupted    INTEGER NOT NULL DEFAULT 0 CHECK (is_interrupted IN (0, 1)),
    parent_message_id TEXT    NOT NULL DEFAULT '',

    -- 本轮中的顺序
    turn_order        INTEGER NOT NULL DEFAULT 0,
    think             INTEGER NOT NULL DEFAULT 1
);

-- 创建索引
-- 按会议ID快速查询消息（最常用）
CREATE INDEX idx_ai_rt_messages_meeting_id ON ai_rt_message (meeting_id);

-- 按会议ID和顺序查询（用于获取有序消息列表）
CREATE INDEX idx_ai_rt_messages_meeting_order ON ai_rt_message (meeting_id, turn_order);

-- 按参与者ID查询消息
CREATE INDEX idx_ai_rt_messages_participant_id ON ai_rt_message (participant_id);

-- 按父消息ID查询回复
CREATE INDEX idx_ai_rt_messages_parent_id ON ai_rt_message (parent_message_id);

-- 按角色筛选消息
CREATE INDEX idx_ai_rt_messages_role ON ai_rt_message (role);

-- 按是否总结筛选
CREATE INDEX idx_ai_rt_messages_is_summary ON ai_rt_message (is_summary);

-- 按创建时间排序（用于时间线视图）
CREATE INDEX idx_ai_rt_messages_created_at ON ai_rt_message (created_at);