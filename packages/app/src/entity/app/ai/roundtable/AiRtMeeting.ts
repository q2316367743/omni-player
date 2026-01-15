import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";
import type {AiRtParticipantCore} from "@/entity/app/ai/roundtable/AiRtParticipant.ts";

/**
 * 圆桌会议状态
 * - active: 激活中
 * - paused: 暂停中
 * - ended: 已结束
 * - archived: 已归档
 */
export type AiRtMeetingStatus = 'active' | 'paused' | 'ended' | 'archived';

export interface AiRtMeetingCore {

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
   * 用户角色
   */
  user_role: string;
}

/**
 * 圆桌会议
 */
export interface AiRtMeeting extends BaseEntity, AiRtMeetingCore {


}

export interface AiRtMeetingAdd extends AiRtMeetingCore {
  participants: Array<AiRtParticipantCore>
}

export function buildAiRtMeetingAdd(groupId: string):AiRtMeetingAdd {
  return {
    participants: [],
    group_id: groupId,
    status: 'active',
    max_rounds: 0,
    summary_interval: 1,
    auto_summary_on_end: 0,
    topic: "",
    content: "",
    user_role: "用户"
  }
}