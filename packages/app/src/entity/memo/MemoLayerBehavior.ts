import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {MemoLayerSource} from "@/entity/memo/MemoCommon.ts";

export type MemoLayerBehaviorType =
  | 'todo'
  | 'habit_cue'
  | 'social_intent'
  | 'avoidance'
  | 'seeking';

export type MemoLayerBehaviorStatus = 'active' | 'completed' | 'snoozed' | 'expired';

export interface MemoLayerBehaviorCore {

  /**
   * 来源
   */
  source: MemoLayerSource;
  /**
   * memo 或者 chat_session
   */
  source_id: string;

  type: MemoLayerBehaviorType;

  /**
   * 具体的行为描述
   */
  behavior: string;

  /**
   * 0~9
   */
  priority: number;

  /**
   * 状态
   */
  status: MemoLayerBehaviorStatus;

  /**
   * 如果有明确的截止日期
   */
  deadline: number;

  /**
   * 提醒时间
   */
  reminder: number;

  /**
   * 有效期
   */
  expire_at: number;
}


/**
 * 行为层 (待办与习惯，7-14天有效期，可主动延长)
 */
export interface MemoLayerBehavior extends BaseEntity, MemoLayerBehaviorCore {
}