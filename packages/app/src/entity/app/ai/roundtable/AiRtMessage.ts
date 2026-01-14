import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {AiChatRole} from "@/global/CommonType.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";
import type {AiRtParticipant} from "@/entity/app/ai/roundtable/AiRtParticipant.ts";
import type {ChatMessageParam} from "@/util/lang/ChatUtil.ts";

/**
 * 圆桌会议 - 聊天消息
 */
export interface AiRtMessage extends BaseEntity {

  /* ----------------------- 关联信息 ----------------------- */
  /**
   * 会议 ID
   */
  meeting_id: string;
  /**
   * 发言者，为空代表是用户
   */
  participant_id: string;

  /* ----------------------- 消息信息 ----------------------- */

  /**
   * 消息角色
   */
  role: AiChatRole;
  /**
   * 深度思考内容
   */
  thinking: string;
  /**
   * 内容
   */
  content: string;

  /* ----------------------- 更多信息 ----------------------- */

  /**
   * 本轮中的顺序
   */
  turn_order: number;

  /**
   * 是否为总结消息，上帝 AI 发出
   */
  is_summary: YesOrNo;

  /**
   * 是否被用户打断，用于续说逻辑
   */
  is_interrupted: YesOrNo;

  /**
   * 若为续说，指向被打断的原消息
   */
  parent_message_id: string;

}

export function transferRtMessageTo(messages: Array<AiRtMessage>, participant:AiRtParticipant, participantMap: Map<string, AiRtParticipant>): Array<ChatMessageParam> {
  const results = new Array<ChatMessageParam>();
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
          content: `[用户] ${message.content}`,
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
    }
  }
  return results;
}