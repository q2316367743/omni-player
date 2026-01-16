import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {AiChatRole} from "@/global/CommonType.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";
import {type AiRtParticipant, buildAiRtParticipantPrompt} from "@/entity/app/ai/roundtable/AiRtParticipant.ts";
import type {ChatMessageParam} from "@/util/lang/ChatUtil.ts";
import type {AiRtMeeting} from "@/entity/app/ai/roundtable/AiRtMeeting.ts";

export interface AiRtMessageCore {
  /**
   * - private-assistant：私聊 - 助手
   * - private-user：私聊 - 用户
   * - summary：总结
   */
  role: AiChatRole | 'private-assistant' | 'private-user' | 'summary';
  thinking: string;
  content: string;
  /**
   * 参与者 ID，只有 assistant 才有，或者私聊用户表示和那个 assistant 私聊
   */
  participant_id: string;
  is_summary: YesOrNo;
  is_interrupted: YesOrNo;
  parent_message_id: string;
}

/**
 * 圆桌会议 - 聊天消息
 */
export interface AiRtMessage extends BaseEntity, AiRtMessageCore {

  /* ----------------------- 关联信息 ----------------------- */
  /**
   * 会议 ID
   */
  meeting_id: string;

  /* ----------------------- 更多信息 ----------------------- */

  /**
   * 本轮中的顺序
   */
  turn_order: number;

}

export function transferRtMessageTo(
  messages: Array<AiRtMessage>,
  meeting: AiRtMeeting,
  participant:AiRtParticipant, participantMap: Map<string, AiRtParticipant>): Array<ChatMessageParam> {
  const results = new Array<ChatMessageParam>();
  results.push({
    role: 'system',
    content: buildAiRtParticipantPrompt(participant, meeting)
  })
  for (const message of messages.sort((a, b) => a.turn_order - b.turn_order)) {
    switch (message.role) {
      case "assistant": {
        // 跳过上帝 AI 的总结
        if (message.is_summary) break;
        if (message.participant_id === participant.id) {
          results.push({
            role: "assistant",
            content: message.content,
          });
          break;
        }
        // 判断是谁
        const target = participantMap.get(message.participant_id);
        if (target) {
          results.push({
            role: "user",
            content: `[${target.name}] ${message.content}`,
          });
        }
        break;
      }
      case 'user': {
        results.push({
          role: "user",
          content: `[${meeting.user_role || "用户"}] ${message.content}`,
        });
        break;
      }
      case "system": {
        results.push({
          role: "system",
          content: message.content,
        });
        break;
      }
      case 'summary': {
        results.push({
          role: "user",
          content: `[主持人] ${message.content}`,
        })
      }
    }
  }
  return results;
}


export function transferRtPrivateMessageTo(
  messages: Array<AiRtMessage>,
  meeting: AiRtMeeting,
  participant:AiRtParticipant,
  participantMap: Map<string, AiRtParticipant>
): Array<ChatMessageParam> {
  const results = new Array<ChatMessageParam>();
  results.push({
    role: 'system',
    content: buildAiRtParticipantPrompt(participant, meeting)
  })
  for (const message of messages.sort((a, b) => a.turn_order - b.turn_order)) {
    switch (message.role) {
      case "assistant": {
        // 跳过上帝 AI 的总结
        if (message.is_summary) break;
        if (message.participant_id === participant.id) {
          results.push({
            role: "assistant",
            content: message.content,
          });
          break;
        }
        // 判断是谁
        const target = participantMap.get(message.participant_id);
        if (target) {
          results.push({
            role: "user",
            content: `[${target.name}] ${message.content}`,
          });
        }
        break;
      }
      case 'user': {
        results.push({
          role: "user",
          content: `[${meeting.user_role || "用户"}] ${message.content}`,
        });
        break;
      }
      case "system": {
        results.push({
          role: "system",
          content: message.content,
        });
        break;
      }
      case "private-assistant": {
        if (message.participant_id !== participant.id) {
          break;
        }
        results.push({
          role: "assistant",
          content: message.content,
        });
        break;
      }
      case "private-user": {
        if (message.participant_id !== participant.id) {
          break;
        }
        results.push({
          role: "user",
          content: message.content,
        });
        break;
      }
    }
  }
  return results;
}