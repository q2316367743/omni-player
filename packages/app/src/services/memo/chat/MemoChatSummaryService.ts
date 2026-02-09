import type {MemoChatSummary, MemoChatSummaryCoreView} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

/**
 * 获取最新的对话总结，只用于聊天
 * @param friendId
 * @param level 等级，默认 L1
 */
export function getMemoChatSummaryLast(friendId: string, level = 1) {
  return useSql().query<MemoChatSummary>('memo_chat_summary')
    .eq('friend_id', friendId)
    .eq('level', level)
    .orderByDesc('created_at')
    .get()
}

export function listMemoChatSummaryL1UnSummary(friendId: string) {
  return useSql().query<MemoChatSummary>('memo_chat_summary')
    .eq('friend_id', friendId)
    .eq('level', 1)
    .eq('archived_to_l2_id', '')
    .orderByAsc('created_at')
    .list();
}

export function saveMemoChatSummary(data: MemoChatSummaryCoreView) {
  const now = Date.now();
  return useSql().mapper<MemoChatSummary>('memo_chat_summary').insert({
    ...data,
    created_at: now,
    updated_at: now,
    layer_operations: JSON.stringify(data.layer_operations)
  });
}

export function updateMemoChatSummary(id: string, data: Partial<MemoChatSummaryCoreView>) {
  const now = Date.now();
  return useSql().mapper<MemoChatSummary>('memo_chat_summary').updateById(id, {
    ...data,
    layer_operations: data.layer_operations ? JSON.stringify(data.layer_operations) : undefined,
    updated_at: now
  });
}