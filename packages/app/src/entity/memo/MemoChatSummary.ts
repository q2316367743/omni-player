import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface MemoChatSummaryLayerOperations {
  operation_id: string;   // 追溯用
  timestamp: number;
}

export interface MemoChatSummaryCore {

  friend_id: string;        // 直接关联伴侣

  // 范围
  level: 1 | 2;             // 1=阶段性短总结 2=主题长总结
  start_time: number;
  end_time: number;

  // 内容
  content: string;          // 自然语言总结（给AI看的上下文）

  /**
   * 当 level 是 1 时有效，此时此对象指向了 l2 的 id
   */
  archived_to_l2_id: string;

  // 关键：不存四层数据，只存"操作记录"
  // 实际四层数据在各自表里，通过 tool_call 写入
  layer_operations: string;

  // 触发信息
  trigger_reason: string;
}

/**
 * 消息总结，由于一个用户只会有一个长聊天，所以只需要一个朋友 id
 */
export interface MemoChatSummary extends BaseEntity, MemoChatSummaryCore {

}

export interface MemoChatSummaryCoreView {

  friend_id: string;        // 直接关联伴侣

  // 范围
  level: 1 | 2;             // 1=阶段性短总结 2=主题长总结
  start_time: number;
  end_time: number;

  // 内容
  content: string;          // 自然语言总结（给AI看的上下文）

  /**
   * 当 level 是 1 时有效，此时此对象指向了 l2 的 id
   */
  archived_to_l2_id: string;

  // 关键：不存四层数据，只存"操作记录"
  // 实际四层数据在各自表里，通过 tool_call 写入
  layer_operations: Array<MemoChatSummaryLayerOperations>;

  // 触发信息
  trigger_reason: string;

}

export interface MemoChatSummaryView extends BaseEntity, MemoChatSummaryCoreView {
}