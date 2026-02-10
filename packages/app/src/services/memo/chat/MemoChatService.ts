import {useSql} from "@/lib/sql.ts";
import {
  type MemoChat,
  type MemoChatCore,
  memoChatCoreFromView,
  type MemoChatCoreView,
  memoChatToView
} from "@/entity/memo";


export function saveMemoChat(data: MemoChatCoreView) {
  const now = Date.now();
  return useSql().mapper<MemoChat>('memo_chat')
    .insert({
      ...memoChatCoreFromView(data),
      token_count: data.content.filter(e => e.type === 'text').reduce((sum, c) => sum + c.content.length, 0),
      created_at: now,
      updated_at: now
    })
}

export function updateMemoChat(id: string, data: Partial<MemoChatCore>) {
  const now = Date.now();
  return useSql().mapper<MemoChat>('memo_chat')
    .updateById(id, {
      ...data,
      updated_at: now
    })
}

/**
 * 获取全部未总结的聊天记录
 * @param friendId
 */
export async function listMemoChatUnSummary(friendId: string) {
  const res = await useSql().query<MemoChat>('memo_chat')
    .eq('friend_id', friendId)
    .eq('compression_level', 0)
    .orderByAsc('created_at')
    .list();
  return res.map(memoChatToView);
}

/**
 * 获取全部未总结的聊天记录，处于处理中
 */
export async function listMemoChatBetween(friendId: string, startTime: number, endTime: number) {
  const res = await useSql().query<MemoChat>('memo_chat')
    .eq('friend_id', friendId)
    .ge('created_at', startTime)
    .le('created_at', endTime)
    .orderByAsc('created_at')
    .list();
  return res.map(memoChatToView);
}

/**
 * 获取指定好友的置顶时间前的指定数量对话，如果数量小于 limit，则代表到顶了
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

/**
 * 获取第一个未总结的聊天信息
 * @param friendId
 * @param limit
 */
export async function listMemoChatAscUnSummary(friendId: string, limit = 10) {
  const res = await useSql().query<MemoChat>('memo_chat')
    .eq('compression_level', 0)
    .eq('friend_id', friendId)
    .orderByAsc('created_at')
    .lastSql("LIMIT " + limit)
    .list();
  return res.map(memoChatToView);
}

/**
 * 获取最后一个未总结的聊天信息
 * @param friendId
 */
export function getMemoChatLastUnSummary(friendId: string) {
  return useSql().query<MemoChat>('memo_chat')
    .eq('compression_level', 0)
    .eq('friend_id', friendId)
    .orderByDesc('created_at')
    .get();
}

/**
 * 获取第一个未总结的聊天信息
 * @param friendId
 */
export function getMemoChatFirstUnSummary(friendId: string) {
  return useSql().query<MemoChat>('memo_chat')
    .eq('compression_level', 0)
    .eq('friend_id', friendId)
    .orderByAsc('created_at')
    .get();
}

/**
 * 获取指定好友的未总结的聊天数量
 * @param friendId 好友ID
 * @return  数量
 */
export async function getMemoChatTotalCountUnSummary(friendId: string): Promise<number> {
  const items = await useSql().query<MemoChat>('memo_chat')
    .select('token_count')
    .eq('friend_id', friendId)
    .eq('compression_level', 0)
    .list();
  return items.reduce((sum, item) => sum + item.token_count, 0);
}

/**
 * 获取指定好友的未总结的聊天数量
 */
export async function countMemoChatUnSummary(friendId: string) {
  return useSql().query<MemoChat>('memo_chat')
    .eq('friend_id', friendId)
    .eq('compression_level', 0)
    .count();
}