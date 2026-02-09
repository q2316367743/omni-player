import type {MemoFriendStaticView} from "@/entity/memo";
import {aiMemoChatL2Summary} from "@/modules/ai/memo";
import {saveMemoChatSummary, updateMemoChatSummary} from "@/services/memo";

export async function setupChatL2Summary(friend: MemoFriendStaticView, trigger_reason: string) {
  const res = await aiMemoChatL2Summary({friend});
  // 保存总结
  const {id: l2ChatSummaryId} = await saveMemoChatSummary({
    ai_journal: res.ai_journal,
    end_time: res.end_time,
    start_time: res.start_time,
    friend_id: friend.id,
    level: 2,
    content: res.summary,
    layer_operations: res.operations,
    archived_to_l2_id: "",
    trigger_reason
  });
  for (const l1Summary of res.l1Summaries) {
    await updateMemoChatSummary(l1Summary.id, {
      archived_to_l2_id: l2ChatSummaryId
    });
  }
}