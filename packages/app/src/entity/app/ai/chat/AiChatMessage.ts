import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {ChatMessageParam} from "@/util/lang/ChatUtil.ts";
import type {TdChatItemMeta} from "@tdesign-vue-next/chat";
import {formatDate} from "@/util/lang/FormatUtil.ts";


export interface AiChatMessageCore {
  // 角色
  role: "system" | "user" | "assistant" | "model-change" | "error";
  // 思考
  thinking: string;
  // 内容
  content: string;
  // 使用的模型
  model: string;
}


export interface AiChatMessage extends BaseEntity, AiChatMessageCore {
  // 索引
  index: number;
  // 所属聊天
  chat_id: string;

}

export function transferAiChatItemToChatMessageParam(items: Array<AiChatMessageCore>): Array<ChatMessageParam> {
  const r = new Array<ChatMessageParam>();
  items.map(item => {
    return {
      role: item.role,
      content: item.content,
      model: item.model,
    }
  }).forEach(e => {
    if (e.role !== 'model-change' && e.role !== 'error') {
      r.push(e as ChatMessageParam);
    }
  });
  return r;
}

export function transferItemToTDesign(items: Array<AiChatMessage>): Array<TdChatItemMeta> {
  return items.map(m => {
    return {
      role: m.role,
      datetime: formatDate(m.created_at),
      name: m.role === 'user' ? '自己' : m.role === 'assistant' ? 'AI' : m.role === 'system' ? '系统' : undefined,
      content: [{
        type: 'text',
        data: m.content
      }]
    } as any
  });
}