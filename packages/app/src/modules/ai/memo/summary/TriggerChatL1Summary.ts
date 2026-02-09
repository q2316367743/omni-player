import {
  countMemoChatUnSummary,
  getMemoChatFirstUnSummary,
  getMemoChatTotalCountUnSummary, listMemoChatAscUnSummary, saveMemoChatSummary, updateMemoChat
} from "@/services/memo";
import {aiMemoChatL1Summary} from "@/modules/ai/memo";
import {logDebug} from "@/lib/log.ts";
import type {MemoFriendStaticView} from "@/entity/memo";

export async function triggerChatL1Summary(friend: MemoFriendStaticView) {
  const friendId = friend.id;
  const now = Date.now();
  const count = await countMemoChatUnSummary(friendId);

  // 1. 核心触发：数量达到 20 条（你的策略）
  const hitCount = count >= 20;
  logDebug("[TriggerChatL1Summary] 触发 L1 总结", friend.id, hitCount);

  const firstChat = await getMemoChatFirstUnSummary(friendId);

  // 2. 辅助触发 A：防止碎片化（必须至少聊了一段时间）
  // 比如至少距离第一次未归档消息过了 10 分钟，防止秒归档
  const hitTime = !firstChat || now - firstChat.created_at < 10 * 60 * 1000;
  logDebug("[TriggerChatL1Summary] 辅助触发 A", friend.id, hitTime);


  const stats = await getMemoChatTotalCountUnSummary(friendId);
  // 3. 辅助触发 B：防止溢出（字数/Token 爆炸）
  // 如果这 20 条消息的总字数已经超过了 40000 字，不管时间，赶紧归档
  const hitLength = stats > 40000;
  logDebug("[TriggerChatL1Summary] 辅助触发 B", friend.id, hitLength);

  if (hitCount && (hitTime || hitLength)) {
    // 触发总结
    logDebug("[TriggerChatL1Summary] 触发 L1 总结", friend.id);
    // 归档范围：最早的 (stats.count - 10) 条
    const messages = await listMemoChatAscUnSummary(friendId);
    if (messages.length === 0) return;
    const summary = await aiMemoChatL1Summary({
      friend: friend,
      messages: messages
    });
    // 1. 插入总结
    logDebug('[TriggerChatL1Summary] 插入总结', friend.id)
    const {id: summaryId} = await saveMemoChatSummary({
      friend_id: friend.id,
      level: 1,
      start_time: messages[0]?.created_at || 0,
      end_time: messages[messages.length - 1]?.created_at || 0,
      content: summary,
      layer_operations: [],
      trigger_reason: `trigger|hitCount:${hitCount ? 'true' : 'false'}|hitTime:${hitTime ? 'true' : 'false'}|hitLength:${hitLength ? 'true' : 'false'}`
    });
    // 2. 修改消息信息
    logDebug('[TriggerChatL1Summary] 修改消息信息', friend.id, messages.length)
    for (const message of messages) {
      await updateMemoChat(message.id, {
        compression_level: 1,
        archived_to_summary_id: summaryId
      });
    }
  }
}