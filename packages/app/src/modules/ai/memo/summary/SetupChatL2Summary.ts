import type {MemoFriendStaticView} from "@/entity/memo";
import {aiMemoChatL2Summary} from "@/modules/ai/memo";

export async function setupChatL2Summary(friend: MemoFriendStaticView, trigger_reason: string) {
  await aiMemoChatL2Summary({friend, trigger_reason});
}