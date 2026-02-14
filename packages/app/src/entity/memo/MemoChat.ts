import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {AiChatRole} from "@/global/CommonType.ts";

// 内容
export interface MemoChatContentText {
  type: 'text',
  content: string;
}
// 思考中
export interface MemoChatContentThink {
  type: 'think',
  content: string;
}
// 调阅 SKILL 技能
export interface MemoChatContentSkill {
  type: 'skill',
}

export interface MemoChatContentMcp {
  type: 'mcp',
  toolName: string;
  args: any;
  result: any;
}

export type MemoChatContent = MemoChatContentText | MemoChatContentThink | MemoChatContentSkill | MemoChatContentMcp;

export interface MemoChatCore {
  friend_id: string;         // AI伴侣ID

  // 内容
  role: AiChatRole | 'summary';
  content: string;           // 内容

  // 压缩标记
  compression_level: 0 | 1 | 2 | 3;  // 0=原始 1=短总结归档 2=长总结归档 3=处理中

  // 如果已被总结，指向总结ID（用于追溯）
  archived_to_summary_id: string;
}

export interface MemoChat extends BaseEntity, MemoChatCore {

  // 轻量元数据（无需复杂索引）
  token_count: number;
}
export interface MemoChatCoreView {

  friend_id: string;         // AI伴侣ID

  // 内容
  role: AiChatRole | 'summary';
  content: Array<MemoChatContent>;           // 内容

  // 压缩标记
  compression_level: 0 | 1 | 2;  // 0=原始 1=短总结归档 2=长总结归档

  // 如果已被总结，指向总结ID（用于追溯）
  archived_to_summary_id: string;

}
export interface MemoChatView extends BaseEntity, MemoChatCoreView {

  // 轻量元数据（无需复杂索引）
  token_count: number;
}

export function memoChatToView(memoChat: MemoChat): MemoChatView {
  return {
    ...memoChat,
    content: JSON.parse(memoChat.content) as Array<MemoChatContent>
  } as MemoChatView;
}

export function memoChatCoreFromView(view: MemoChatCoreView): MemoChatCore {
  return {
    ...view,
    content: JSON.stringify(view.content)
  } as MemoChatCore;
}

export interface MemoChatItemView {
  id: string
  sender: AiChatRole | 'summary'
  content: Array<MemoChatContent>
  timestamp: number
}