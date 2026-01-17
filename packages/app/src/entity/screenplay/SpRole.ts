import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export interface SpRoleCore {
  /**
   * 剧本 ID
   */
  screenplay_id: string;
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
   * 是否为叙述者
   */
  in_narrator: YesOrNo;
}

export interface SpRole extends BaseEntity, SpRoleCore {
}