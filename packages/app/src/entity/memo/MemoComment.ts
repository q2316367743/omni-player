import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export interface MemoCommentCore {

  memo_id: string;
  /**
   * 朋友ID，为空代表是我自己的回复
   */
  friend_id: string;
  /**
   * 内容
   */
  content: string;
  /**
   * 不存在 - 一级评论，存在 - 二级回复
   */
  parent_id: string;

  /**
   * 标记是否由 @ 触发（用于统计/展示）
   */
  is_mention_reply: YesOrNo;
}

/**
 * 评论
 */
export interface MemoComment extends BaseEntity, MemoCommentCore {

}