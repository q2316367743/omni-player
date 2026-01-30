import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 会话状态
 * - chat: 正在聊天中
 * - done: 会话结束
 */
export type MemoSessionStatus = 'chat' | 'done';

/**
 * 一次聊天信息
 */
export interface MemoSession extends BaseEntity {
  /**
   * 和哪个人会话
   */
  friend_id: string;

  /**
   * 状态
   */
  status: MemoSessionStatus
}