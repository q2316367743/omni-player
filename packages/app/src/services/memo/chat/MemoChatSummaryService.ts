import type {MemoChatSummary} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function listMemoChatSummaryLast(friendId: string) {
  return useSql().query<MemoChatSummary>('memo_chat_summary')
    .eq('friend_id', friendId)
    .orderByDesc('created_at')
    .get()
}