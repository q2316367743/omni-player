import type {MemoChatSummary, MemoChatSummaryCoreView} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

/**
 * 获取最新的对话总结，只用于聊天
 * @param friendId
 */
export function listMemoChatSummaryLast(friendId: string) {
  return useSql().query<MemoChatSummary>('memo_chat_summary')
    .eq('friend_id', friendId)
    .eq('level', 1)
    .orderByDesc('created_at')
    .get()
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