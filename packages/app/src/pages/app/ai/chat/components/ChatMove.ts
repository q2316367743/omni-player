import {moveAiChatItemService} from "@/services/app/chat";
import MessageUtil from "@/util/model/MessageUtil.ts";

interface ChatMoveProps {
  chatId: string;
  targetGroupId: string;
  onSuccess?: () => void;
}

/**
 * 对话移动
 */
export async function chatMove(props: ChatMoveProps) {
  const {chatId, targetGroupId, onSuccess} = props;
  await moveAiChatItemService(chatId, targetGroupId);
  onSuccess?.();
  MessageUtil.success("移动成功");

}