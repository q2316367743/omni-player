import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 剧本场景
 */
export interface SpScene extends BaseEntity {

  screenplay_id: string;

  /**
   * 场景吗（如“市政厅会议室”）
   */
  name: string;

  /**
   * 场景描述（时间/天气/氛围）
   */
  description: string;

  /**
   * 场景顺序
   */
  order_index: number;


}