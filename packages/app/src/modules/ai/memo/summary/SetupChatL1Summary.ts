import {getMemoChatLastUnSummary, listMemoChatUnSummary, saveMemoChatSummary, updateMemoChat} from "@/services/memo";
import {useMemoFriendStore} from "@/store";
import {aiMemoChatL1Summary} from "@/modules/ai/memo";
import {logDebug, logError} from "@/lib/log.ts";

/**
 * 启动时触发 L1 总结
 */
export async function setupChatL1Summary() {
  const now = Date.now();
  const {friends} = useMemoFriendStore();
  for (const friend of friends) {
    try {
      // 获取未总结的最后一条
      logDebug('[SetupChatL1Summary] 启动时触发 L1 总结', friend.id)
      const lastChat = await getMemoChatLastUnSummary(friend.id);
      if (!lastChat) continue;
      // 需要满足 时间间隔，最后一条聊天记录需要大于 2 小时
      logDebug('[SetupChatL1Summary] 满足时间间隔条件', friend.id)
      if (now - lastChat.created_at < 2 * 60 * 60 * 1000) continue;
      const messages = await listMemoChatUnSummary(friend.id);
      if (messages.length === 0) continue;
      const summary = await aiMemoChatL1Summary({
        friend: friend,
        messages: messages
      });
      // 1. 插入总结
      logDebug('[SetupChatL1Summary] 插入总结', friend.id)
      const {id: summaryId} = await saveMemoChatSummary({
        friend_id: friend.id,
        level: 1,
        start_time: messages[0]?.created_at || 0,
        end_time: messages[messages.length - 1]?.created_at || 0,
        content: summary,
        layer_operations: [],
        archived_to_l2_id: '',
        trigger_reason: 'setup'
      });
      // 2. 修改消息信息
      logDebug('[SetupChatL1Summary] 修改消息信息', friend.id, messages.length)
      for (const message of messages) {
        await updateMemoChat(message.id, {
          compression_level: 1,
          archived_to_summary_id: summaryId
        });
      }
    }catch (e) {
      logError("[SetupChatL1Summary] 总结 L1 信息失败", e);
    }
  }
}

