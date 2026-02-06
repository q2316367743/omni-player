import {useSql} from "@/lib/sql.ts";
import {type MemoChat, memoChatCoreFromView, type MemoChatCoreView, memoChatToView} from "@/entity/memo";

export function listMemoChatUnSummary(friendId: string) {
  return useSql().query<MemoChat>('memo_chat')
    .eq('friend_id', friendId)
    .eq('compression_level', 0)
    .orderByAsc('created_at')
    .list()
    .then(res => res.map(memoChatToView))
}

/**
 * 获取指定好友的置顶时间前的指定数量对话，如果数量小于 limit，则代码到顶了
 * @param friendId 好友ID
 * @param createdAt 创建时间
 * @param limit 限制数量
 */
export async function listMemoChatTimestamp(friendId: string, createdAt: number, limit: number) {
  const res = await useSql().query<MemoChat>('memo_chat')
    .eq('friend_id', friendId)
    .lt('created_at', createdAt)
    .orderByAsc('created_at')
    .lastSql("LIMIT " + limit)
    .list();
  return res.map(memoChatToView);
}

export function saveMemoChat(data: MemoChatCoreView) {
  const now = Date.now();
  return useSql().mapper<MemoChat>('memo_chat')
    .insert({
      ...memoChatCoreFromView(data),
      created_at: now,
      updated_at: now
    })
}