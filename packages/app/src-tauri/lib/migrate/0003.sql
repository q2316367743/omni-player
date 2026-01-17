CREATE TABLE screenplay
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    title      TEXT    NOT NULL,
    background TEXT    NOT NULL,
    tags       TEXT    NOT NULL
);

CREATE INDEX idx_screenplay_created_at ON screenplay (created_at);
CREATE INDEX idx_screenplay_updated_at ON screenplay (updated_at);

CREATE TABLE sp_scene
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL,
    screenplay_id TEXT    NOT NULL,
    `name`        TEXT    NOT NULL,
    `description` TEXT    NOT NULL,
    order_index   INTEGER NOT NULL
);

CREATE INDEX idx_sp_scene_screenplay_id ON sp_scene (screenplay_id);
CREATE INDEX idx_sp_scene_order ON sp_scene (`order_index`);

CREATE TABLE sp_role
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL,
    screenplay_id TEXT    NOT NULL,
    `name`        TEXT    NOT NULL,
    `identity`    TEXT    NOT NULL,
    secret_info   TEXT    NOT NULL,
    personality   TEXT    NOT NULL,
    in_narrator   INTEGER NOT NULL
);

CREATE INDEX idx_sp_role_screenplay_id ON sp_role (screenplay_id);
CREATE INDEX idx_sp_role_in_narrator ON sp_role (in_narrator);

CREATE TABLE sp_dialogue
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL,
    screenplay_id TEXT    NOT NULL,
    scene_id      TEXT    NOT NULL,
    turn_order    INTEGER NOT NULL,
    `type`        TEXT    NOT NULL,
    role_id       TEXT    NOT NULL,
    `action`      TEXT    NOT NULL,
    dialogue      TEXT    NOT NULL
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

CREATE TABLE RoleAppearance
(
    id         INTEGER PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    role_id    TEXT    NOT NULL DEFAULT '',
    scene_id   TEXT    NOT NULL DEFAULT '',
    enter_turn INTEGER NOT NULL DEFAULT 0, -- 进入场景的对话序号（可选）
    exit_turn  INTEGER NOT NULL DEFAULT 0, -- 离开场景的对话序号（可选）
    is_active  BOOLEAN NOT NULL DEFAULT 1, -- 当前是否在场景中（用于快速查询）
    FOREIGN KEY (role_id) REFERENCES sp_role (id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES sp_scene (id) ON DELETE CASCADE,
    UNIQUE (role_id, scene_id)             -- 同一角色在同一场景只记录一次
);