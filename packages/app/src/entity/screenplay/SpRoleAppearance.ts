import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface SpRoleAppearance extends BaseEntity {
  /**
   * 剧本 ID
   */
  screenplay_id: string;
  /**
   * 角色 ID
   */
  role_id: string;
  /**
   * 场景 ID
   */
  scene_id: string;
  /**
   * 进入场景的对话序号（可选）
   */
  enter_turn?: number;
  /**
   * 离开场景的对话序号（可选）
   */
  exit_turn?: number;
  /**
   * 当前是否在场景中（用于快速查询）
   */
  is_active?: boolean;
}