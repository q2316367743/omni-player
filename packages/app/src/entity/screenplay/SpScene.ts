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

  /**
   * 本场景必须达成的叙事目标
   * @example 揭示林美如死前曾向至少一人透露过‘稿子’的存在
   */
  narrative_goal: string;

  /**
   * 必须在此场景揭露的关键线索（JSON 数组）
   * @example ["镜面字迹色号=琴子口红", "小红书无口红视频", "陌生香水味"]
   */
  key_clues: string;

  /**
   * 必须发生的角色坦白/冲突（JSON 数组）
   * @example ["琴子承认知道稿子", "西西暴露与林美如的争执"]
   */
  required_revelations: string;

  /**
   * 动态终止策略
   * - 'goal_driven',      -- 目标达成即结束（默认）
   * - 'tension_peak',     -- 情绪峰值后结束
   * - 'external_event',   -- 等待外部事件（如警察敲门）
   * - 'manual'            -- 手动控制（导演模式）
   */
  termination_strategy: 'goal_driven' | 'tension_peak' | 'external_event' | 'manual'

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