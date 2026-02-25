import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/CommonType.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

/**
 * 圆桌会议 - 角色类型
 * - admin: 管理员
 * - member: 成员
 */
export type AiRtRoleType = 'admin' | 'member';

export interface AiRtRoleUpdate {
  /**
   * 角色名称
   */
  name: string;
  /**
   * 提示词
   */
  prompt: string;
  /**
   * 使用的模型，这里是默认模型，在真正聊天时可以自己修改
   */
  model: string;

  /**
   * 最小响应字数，防止敷衍，-1 代表无限制
   */
  min_response_length: number;

  /**
   * 最大响应字数，-1 代表无限制
   */
  max_response_length: number;

  /**
   * 生成随机性，默认 0.7，上帝 AI 课设为 0.3更稳
   */
  temperature: number;

  /**
   * 是否启用事实核查（未来拓展）
   * @example 0
   */
  enable_fact_checking: YesOrNo;

  /**
   * 是否允许 AI 主动 @ 他人
   * @example 0
   */
  allow_cross_talk: YesOrNo;

  /**
   * 最大思考时间（秒）
   * @example 30
   */
  timeout_per_turn: number;

}

export interface AiRtRoleAdd extends AiRtRoleUpdate {

  /**
   * 类型
   */
  type: AiRtRoleType;
}

/**
 * 圆桌会议 - 角色
 */
export interface AiRtRole extends BaseEntity, AiRtRoleAdd {

}

export function buildAiRtRoleAdd(type: AiRtRoleType): AiRtRoleAdd{
  return {
    name: "",
    prompt: "",
    type: type,
    model: useSettingStore().aiSetting.defaultChatModel,
    min_response_length: 50,
    max_response_length: -1,
    temperature: type === 'admin' ? 0.3 : 0.7,
    enable_fact_checking: 0,
    allow_cross_talk: 0,
    timeout_per_turn: 30
  }
}