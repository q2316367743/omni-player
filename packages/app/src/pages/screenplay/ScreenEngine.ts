import type {Screenplay, SpDialogue, SpRole, SpScene} from "@/entity/screenplay";

export interface ScreenEngineConfig {
  screenplay: Screenplay;
  maxSceneTurns?: number;
  // 获取当前的场景
  getCurrentScene: () => SpScene | undefined;
  // 获取全部的场景
  getScenes: () => Array<SpScene>;
  // 获取叙述者
  getNarrator: () => SpRole | undefined;
  // 获取全部的角色
  getRoles: () => SpRole[];
  // 获取角色映射
  getRoleMap: () => Map<string, SpRole>;
  // 获取当前场景的全部对话
  getDialogues: () => SpDialogue[];

  // ------------------------------------------------
  // -------------------- 各种事件 --------------------
  // ------------------------------------------------

  // 对话更新
  onDialogueUpdate?: () => void;
}

export class ScreenEngine {
  public readonly config: ScreenEngineConfig;
  constructor(config: ScreenEngineConfig) {
    this.config = config;
  }
}