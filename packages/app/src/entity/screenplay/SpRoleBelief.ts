import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/CommonType.ts";

export interface SpRoleBeliefCore {

  /**
   * 剧本 ID
   */
  screenplay_id: string;
  /**
   * 角色 ID
   */
  role_id: string;
  /**
   * 推断内容（如“A 在说谎”）
   */
  content: string;
  /**
   * 置信度 0～1
   */
  confidence: number;
  /**
   * 源自那条对话（可选）
   */
  source_dialogue_id: string;
  /**
   * 是否仍有效（撤回是设为 0）
   */
  is_active: YesOrNo
}

/**
 * 剧本角色主观推断表
 */
export interface SpRoleBelief extends BaseEntity, SpRoleBeliefCore {
}