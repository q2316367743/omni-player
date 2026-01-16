import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 发言意向日志表
 */
export interface SpInitiativeLog extends BaseEntity {
  /**
   * 关联到即将发生的对话
   */
  dialogue_id: string;
  /**
   * 角色 ID
   */
  role_id: string;
  /**
   * 发言意向分
   */
  score: number;
  /**
   * 因子
   * JSON: {"emotion": +20, "mentioned": +30}
   */
  factors: string;
}