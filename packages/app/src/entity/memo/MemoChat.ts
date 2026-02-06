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
// 调用 mcp 功能

export type MemoChatContent = MemoChatContentText | MemoChatContentThink;

export interface MemoChatCore {
  friend_id: string;         // AI伴侣ID

  // 内容
  role: AiChatRole;
  content: string;           // 内容

  // 压缩标记
  compression_level: 0 | 1 | 2;  // 0=原始 1=短总结归档 2=长总结归档

  // 如果已被总结，指向总结ID（用于追溯）
  archived_to_summary_id?: string;

  // 轻量元数据（无需复杂索引）
  token_count: number;
}

export interface MemoChat extends BaseEntity, MemoChatCore {
}
export interface MemoChatCoreView {

  friend_id: string;         // AI伴侣ID

  // 内容
  role: AiChatRole;
  content: Array<MemoChatContent>;           // 内容

  // 压缩标记
  compression_level: 0 | 1 | 2;  // 0=原始 1=短总结归档 2=长总结归档

  // 如果已被总结，指向总结ID（用于追溯）
  archived_to_summary_id?: string;

  // 轻量元数据（无需复杂索引）
  token_count: number;

}
export interface MemoChatView extends BaseEntity, MemoChatCoreView {
}