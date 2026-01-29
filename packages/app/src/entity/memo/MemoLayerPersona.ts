import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {MemoLayerSource} from "@/entity/memo/MemoCommon.ts";

/**
 * 人格名称
 * - openness: 开放性
 * - conscientiousness: 尽责性
 * - extraversion: 外向性
 * - agreeableness: 友好的性
 * - neuroticism: 神经过敏性（神经质）
 * - resilience: 弹性
 * - curiosity: 好奇心
 * - optimism: 乐观
 */
export type MemoLayerPersonaName =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'neuroticism'
  | 'resilience'
  | 'curiosity'
  | 'optimism'

export interface MemoLayerPersona extends BaseEntity {

  /**
   * 来源
   */
  source: MemoLayerSource;
  /**
   * memo 或者 chat_session
   */
  source_id: string;

  /**
   * 特征名称
   */
  trait_name: MemoLayerPersonaName;

  /**
   * 单位变化量，0～99
   */
  delta: number;

  /**
   * 用户该特质的基线水平（由多次_memo_累积得出）
   */
  baseline_trait: number;

  /**
   * 模型对此判断的置信度，0～99
   */
  confidence: number;

  /**
   * 证据原文片段（生成explanation用），对此字段存疑
   */
  evidence_snippet: string;

  /**
   * 有效期
   */
  expire_at: number;

}