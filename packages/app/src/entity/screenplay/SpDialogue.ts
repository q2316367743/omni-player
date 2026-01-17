import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type SpDialogueType = 'role' | 'narrator' | 'event' | 'system';

export interface SpDialogueCore {

  /**
   * 剧本 ID
   */
  screenplay_id: string;

  /**
   * 当前场景
   */
  scene_id: string;

  /**
   * 对话类型
   */
  type: SpDialogueType;

  /**
   * 角色发言时，type='role' 时必填
   */
  role_id: string;

  /**
   * 动作/神态（如“攥紧拳头”）
   */
  action: string;
  /**
   * 对话文本（可为空，如纯动作）
   */
  dialogue: string;

}

/**
 * 剧本对话表
 */
export interface SpDialogue extends BaseEntity, SpDialogueCore {

  /**
   * 对话序号（全局递增）
   */
  turn_order: number;
}