import type {MemoFriend, MemoFriendDynamic, MemoFriendStatic} from "@/entity/memo";
import {defineStore} from "pinia";
import {listMemoFriend, updateMemoFriendStatic, updateMemoFriendDynamic} from "@/services/memo";

export const useMemoFriendStore = defineStore('memo-friend', () => {
  const friends = ref(new Array<MemoFriend>());
  const friendMap = ref(new Map<string, MemoFriend>());

  async function loadFriends() {
    friends.value = await listMemoFriend();
    friendMap.value = new Map(friends.value.map(f => [f.id, f]));
  }

  async function updateFriendStatic(id: string, data: Partial<MemoFriendStatic>) {
    await updateMemoFriendStatic(id, data);
    // 刷新
    await loadFriends();
  }

  async function updateFriendDynamic(id: string, data: Partial<MemoFriendDynamic>) {
    await updateMemoFriendDynamic(id, data);
    // 刷新
    await loadFriends();
  }

  return {
    friends, friendMap,
    loadFriends, updateFriendStatic, updateFriendDynamic
  }
})