import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface SpSceneCore {

  screenplay_id: string;

  /**
   * 场景名称（如“市政厅会议室”）
   */
  name: string;

  /**
   * 场景描述（时间/天气/氛围）
   */
  description: string;

}

/**
 * 剧本场景
 */
export interface SpScene extends BaseEntity, SpSceneCore {

  /**
   * 场景顺序
   */
  order_index: number;
}