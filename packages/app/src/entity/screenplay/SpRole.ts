import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 角色类型
 * - member：成员
 * - narrator：叙述者
 */
export type SpRoleType = 'member' | 'narrator';

export const SpRoleTypeMap: Record<SpRoleType, string> = {
  member: '成员',
  narrator: '叙述者',
};

export interface SpRoleCore {
  /**
   * 剧本 ID
   */
  screenplay_id: string;
  /**
   * 类型
   */
  type: SpRoleType
  /**
   * 角色名（如“李维”）
   */
  name: string;
  /**
   * 公开身份（如“前 AI 工程师”）
   */
  identity: string;
  /**
   * 私有信息（初始秘密，仅该角色知道）
   */
  secret_info: string;
  /**
   * 性格描述（用于生成行为）
   */
  personality: string
  /**
   * 角色使用的模型
   */
  model: string;
}

export interface SpRole extends BaseEntity, SpRoleCore {
}