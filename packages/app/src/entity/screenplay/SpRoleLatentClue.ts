import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 剧本角色 - 潜在线索表
 */
export interface SpRoleLatentClue extends BaseEntity {

  /**
   * 剧本 ID
   */
  screenplay_id: string;
  /**
   * 角色 ID
   */
  role_id: string;

  /**
   * 线索内容（如“A 的手表停在 20：45”）
   */
  content: string;
  /**
   * 源自那条对话
   */
  source_dialogue_id: number;
  /**
   * 发生在哪个场景，如果为空，则代表是场外事件
   */
  scene_id: string;
  /**
   * 状态
   * - active: 激活
   * - resolved: 解决
   * - discarded: 废弃
   */
  status: 'active' | 'resolved' | 'discarded'

}