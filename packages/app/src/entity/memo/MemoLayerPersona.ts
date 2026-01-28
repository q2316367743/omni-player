import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {MemoLayerSource} from "@/entity/memo/MemoCommon.ts";

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