import type {MemoSession} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function loadMemoSessionIng() {
  return useSql().query<MemoSession>('memo_session')
    .eq('status', 'chat')
    .list();
}

export function getMemoSession(id: string) {
  return useSql().query<MemoSession>('memo_session')
    .eq('id', id)
    .get();
}

export function createMemoSession(friendId: string) {
  return useSql().mapper<MemoSession>('memo_session').insert({
    friend_id: friendId,
    status: 'chat',
  });
}

export function completeMemoSession(id: string) {
  return useSql().mapper<MemoSession>('memo_session')
    .updateById(id, {
      status: 'done',
    })
}