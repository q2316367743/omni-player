import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {MemoLayerSource} from "@/entity/memo/MemoCommon.ts";

/**
 * 情绪类型
 * - anger: 生气
 * - joy: 满足
 * - anxiety: 焦虑
 * - sadness: 悲伤
 * - fear: 害怕
 * - disgust: 厌恶
 * - surprise: 惊讶
 * - neutral: 中性
 */
export type MemoLayerEmotionType =
  | 'anger'
  | 'anxiety'
  | 'joy'
  | 'sadness'
  | 'fear'
  | 'disgust'
  | 'surprise'
  | 'neutral'

/**
 * 情绪层 (短期，3-7天有效期)
 */
export interface MemoLayerEmotion extends BaseEntity {

  /**
   * 来源
   */
  source: MemoLayerSource;
  /**
   * memo 或者 chat_session
   */
  source_id: string;

  /**
   * 情绪类型
   */
  emotion_type: MemoLayerEmotionType;

  /**
   * 强度，0~9
   */
  intensity: number;

  /**
   * 触发给情绪的话题
   */
  trigger_topic: string;

  /**
   * 有效期
   */
  expire_at: number;

}


const map: Record<string, string> = {
  'anger': '生气',
  'anxiety': '焦虑',
  'joy': '开心',
  'sadness': '悲伤',
  'fear': '害怕',
  'disgust': '厌恶',
  'surprise': '惊讶',
  'neutral': '中立'
};

// 辅助 Label 映射函数 (简化版)
export function getEmotionLabel(type: MemoLayerEmotionType): string {
  return map[type] || type;
}