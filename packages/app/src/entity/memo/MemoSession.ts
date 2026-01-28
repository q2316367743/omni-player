import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 一次聊天信息
 */
export interface MemoSession extends BaseEntity {
  /**
   * 和哪个人会话
   */
  friend_id: string;
}