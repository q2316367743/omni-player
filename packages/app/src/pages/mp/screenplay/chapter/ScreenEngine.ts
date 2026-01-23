import type {Screenplay, SpRole, SpScene} from "@/entity/screenplay";
import {openSpSceneAdd} from "@/pages/mp/screenplay/chapter/func/SpSceneEdit.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";

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
  getChapterId: () => string | undefined;

  // ------------------------------------------------
  // -------------------- 各种事件 --------------------
  // ------------------------------------------------

  onRefreshRole: () => void;
  onRefreshChapter: () => void;
  onRefreshScene: () => void;

}

export class ScreenEngine {
  public readonly config: ScreenEngineConfig;
  constructor(config: ScreenEngineConfig) {
    this.config = config;
  }

  enterScene() {
    const chapterId = this.config.getChapterId();
    if (!chapterId) return MessageUtil.error('请选择一个章节！');
    openSpSceneAdd(
      this.config.screenplay.id,
      chapterId,
      () => {
        this.config.onRefreshScene();
      }
    )
  }
}