import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {AiRtRoleAdd, AiRtRoleType} from "@/entity/app/ai/roundtable/AiRtRole.ts";
import type {YesOrNo} from "@/global/CommonType.ts";
import type {AiRtMeeting} from "@/entity/app/ai/roundtable";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

/**
 * 圆桌会议 - 角色关联场景
 * - meeting: 会议角色
 * - group: 讨论组角色
 */
export type AiRtRelatedRoleScope = 'meeting' | 'group';

export interface AiRtParticipantCore extends AiRtRoleAdd {

  /**
   * 角色关联场景
   */
  scope: AiRtRelatedRoleScope;

  /**
   * 角色关联场景 ID
   * - meeting: 会议 ID
   * - group: 讨论组 ID
   */
  scope_id: string;

  /**
   * 场景提示词，具体的身份信息/行为信息/立场信息
   */
  scene_prompt: string;

  /**
   * 发言顺序
   */
  join_order: number;

  /**
   * 立场
   */
  stance: string;

  /**
   * 是否参与本轮，支持中途禁言
   */
  is_active: YesOrNo;
}

/**
 * 圆桌会议 - 参与者
 */
export interface AiRtParticipant extends BaseEntity, AiRtParticipantCore {

}

export function buildAiRtParticipantCore(type: AiRtRoleType): AiRtParticipantCore {
  return {
    scope: 'meeting',
    scope_id: '',
    scene_prompt: '',
    join_order: 0,
    stance: '',
    is_active: 1,
    prompt: "",
    type,
    model: useSettingStore().aiSetting.defaultChatModel,
    name: "",
    min_response_length: 50,
    max_response_length: 800,
    temperature: type === 'admin' ? 0.3 : 0.7,
    enable_fact_checking: 1,
    allow_cross_talk: 0,
    timeout_per_turn: 30
  };
}

export function buildAiRtParticipantPrompt(participant: AiRtParticipantCore, meeting: AiRtMeeting): string {
  return [
    `你是【${participant.name}】，${participant.prompt}`,
    `本次会议主题：${meeting.topic}`,
    `本场会议的内容是：${meeting.content}`,
    `场景上下文：${participant.scene_prompt || '无'}`,
    `你的立场：${participant.stance || '中立'}`,
    "请基于其他参与者的发言进行回应，不要重复已有观点。"
  ].join("\n")
}