import type {AiChatMessage, AiChatMessageCore} from "@/entity/app/ai/chat";
import {useSql} from "@/lib/sql.ts";

/**
 * 新增聊天
 */
export async function addAiChatMessageService(chatId: string, messages: Array<AiChatMessageCore>) {
  // 获取数量
  const count = await useSql().query<AiChatMessage>('ai_chat_message').eq('chat_id', chatId).count();
  await useSql().beginTransaction(async sql => {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      await sql.mapper<AiChatMessage>('ai_chat_message').insert({
        ...message,
        chat_id: chatId,
        created_at: Date.now(),
        updated_at: Date.now(),
        index: count + i,
      });
    }
  })
}

export function listAiChatMessageService(chatId: string) {
  return useSql().query<AiChatMessage>('ai_chat_message')
    .eq('chat_id', chatId)
    .orderByDesc('index')
    .list();
}

export function updateAiChatMessageService(id: string, message: Partial<AiChatMessageCore>) {
  return useSql().mapper<AiChatMessage>('ai_chat_message').updateById(id, message);
}