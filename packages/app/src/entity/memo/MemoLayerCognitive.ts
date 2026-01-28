import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {MemoLayerSource} from "@/entity/memo/MemoCommon.ts";

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