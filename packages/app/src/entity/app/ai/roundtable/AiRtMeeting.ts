import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export type AiRtMeetingStatus = 'active' | 'paused' | 'ended' | 'archived';

/**
 * 圆桌会议
 */
export interface AiRtMeeting extends BaseEntity {

  /**
   * 所属讨论组，可以为空
   */
  group_id: string;

  /**
   * 会议主题
   */
  topic: string;

  /**
   * 会议内容
   */
  content: string;

  /* ----------------------- 会议设置 ----------------------- */

  /**
   * 会议状态
   */
  status: AiRtMeetingStatus;

  /**
   * 最大发言轮数
   * 0 表示无限制
   */
  max_rounds: number;

  /**
   * 每 N 轮后触发上帝AI总结（如设为 3，则第3、6、9轮后总结）
   */
  summary_interval: number;

  /**
   * 会议结束时是否自动触发最终总结
   */
  auto_summary_on_end: YesOrNo;

  /**
   * 是否允许用户随时插话打断
   */
  allow_user_interruption: YesOrNo;

}