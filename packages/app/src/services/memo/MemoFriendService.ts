import type {MemoFriend, MemoFriendDynamic, MemoFriendStatic} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function listMemoFriend() {
  return useSql().query<MemoFriend>('memo_friend').list();
}

export function updateMemoFriendStatic(id: string, data: Partial<MemoFriendStatic>) {
  return useSql().mapper<MemoFriend>('memo_friend').updateById(id, data);
}

export function updateMemoFriendDynamic(id: string, data: Partial<MemoFriendDynamic>) {
  return useSql().mapper<MemoFriend>('memo_friend').updateById(id, data);
}