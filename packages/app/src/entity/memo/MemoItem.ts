import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export type MemoItemType = 'normal' | 'memo' | 'private';

export interface MemoItemCore {

  /**
   * 类型，分为普通/备忘/隐私
   */
  type: MemoItemType;
  /**
   * 是否已被消费，当类型是普通的时候，此字段有效
   */
  consumed: YesOrNo;

  /**
   * 朋友ID，多个以逗号分隔，memo 是可以 @ 指定好友的
   */
  friend_ids: string;
}

/**
 * memo 项
 */
export interface MemoItem extends BaseEntity, MemoItemCore {
}