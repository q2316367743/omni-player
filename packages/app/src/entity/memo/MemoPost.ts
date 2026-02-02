import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export interface MemoPostCore {

  // 发布人，如果不存在则代表用户发送
  friend_id: string;
  // 朋友圈内容，支持 md
  content: string;
  // 朋友圈图片，JSON: ['https://example.com/temp.png']
  media_urls: string;
  /**
   * 朋友圈地理位置
   */
  location: string;

  /**
   * 触发来源（用户追踪 & 限流）
   *
   *'/memo/:id' 或者 '/post/:id'
   */
  triggered_by: string;

  /**
   * 匹配到的关键字，只有 ai 自动发朋友圈时才有
   */
  trigger_keyword: string;
}

export interface MemoPostUpdate extends MemoPostCore {

  /**
   * 是否喜欢
   */
  is_like: YesOrNo;
}

/**
 * 朋友圈
 *
 * 1. 用户发完 memo，有几触发 ai 朋友圈
 * 2. 用户聊完天，产生了总结，有几率触发 ai 朋友圈
 * 3. 用户可以主动发朋友圈
 */
export interface MemoPost extends BaseEntity, MemoPostUpdate {

}