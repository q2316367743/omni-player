import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 评论
 */
export interface MemoPostComment extends BaseEntity {
  post_id: string;
  /**
   * 朋友 ID，如果为空则代表是用户
   */
  friend_id: string;

  /**
   * 内容
   */
  content: string;

}