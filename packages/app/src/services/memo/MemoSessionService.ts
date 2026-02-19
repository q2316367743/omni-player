import type {MemoSession} from "@/entity/memo";
import {useMemoSql} from "@/lib/sql.ts";

export function loadMemoSessionIng() {
  return useMemoSql().query<MemoSession>('memo_session')
    .eq('status', 'chat')
    .list();
}

export function getMemoSession(id: string) {
  return useMemoSql().query<MemoSession>('memo_session')
    .eq('id', id)
    .get();
}

export function createMemoSession(friendId: string) {
  return useMemoSql().mapper<MemoSession>('memo_session').insert({
    friend_id: friendId,
    status: 'chat',
  });
}

export function completeMemoSession(id: string) {
  return useMemoSql().mapper<MemoSession>('memo_session')
    .updateById(id, {
      status: 'done',
    })
}

/**
 * 统计伙伴的聊天次数
 * @param friendId 伙伴
 * @returns 聊天次数
 */
export function countMemoSession(friendId: string) {
  return useMemoSql().query<MemoSession>('memo_session')
    .eq('friend_id', friendId)
    .count();
}