import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {MemoLayerSource} from "@/entity/memo/MemoCommon.ts";

/**
 * 类型
 * - value_conflict: 冲突
 * - unsolved_problem: 未解决
 * - growth_need: 成长需求
 * - relationship_issue: 关系问题
 * - existential: 存在性
 */
export type MemoLayerCognitiveType =
  | 'value_conflict'
  | 'unsolved_problem'
  | 'growth_need'
  | 'relationship_issue'
  | 'existential'

/**
 * 认知层 (中期，14-30天有效期)
 */
export interface MemoLayerCognitive extends BaseEntity {

  /**
   * 来源
   */
  source: MemoLayerSource;
  /**
   * memo 或者 chat_session
   */
  source_id: string;

  /**
   * 核心话题（如"职场公平"）
   */
  topic: string;

  type: MemoLayerCognitiveType;

  /**
   * 重要性 0～9
   */
  importance: number;

  /**
   * 认知扭曲类型（如"灾难化"、"读心术"）
   */
  cognitive_distortion: string;

  /**
   * 有效期
   */
  expire_at: number;
}