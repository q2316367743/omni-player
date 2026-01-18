import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 情绪状态表
 */
export interface SpRoleEmotion extends BaseEntity {

  /**
   * 剧本 ID
   */
  screenplay_id: string;
  /**
   * 角色 ID
   */
  role_id: string;

  /**
   * 情绪类型（如“anxiety”，“anger”）
   * - anxiety：焦虑
   * - anger：愤怒
   */
  emotion_type: string;
  /**
   * 强度 0～100
   */
  intensity: number;

}