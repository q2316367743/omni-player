import type {AiChatMessage, AiChatMessageCore} from "@/entity/app/ai/chat";
import {useSql} from "@/lib/sql.ts";

/**
 * 新增聊天
 */
export async function addAiChatMessageService(chatId: string, message: AiChatMessageCore) {
  // 获取数量
  const count = await useSql().query<AiChatMessage>('ai_chat_message').eq('chat_id', chatId).count();
  const sql = useSql();
  const {id} = await sql.mapper<AiChatMessage>('ai_chat_message').insert({
    ...message,
    chat_id: chatId,
    created_at: Date.now(),
    updated_at: Date.now(),
    index: count,
  });
  return id;
}

export function listAiChatMessageService(chatId: string) {
  return useSql().query<AiChatMessage>('ai_chat_message')
    .eq('chat_id', chatId)
    .orderByAsc('index')
    .list();
}

export function updateAiChatMessageService(id: string, message: Partial<AiChatMessageCore>) {
  return useSql().mapper<AiChatMessage>('ai_chat_message').updateById(id, message);
}

export function removeAiChatMessageService(id: string) {
  return useSql().mapper<AiChatMessage>('ai_chat_message').deleteById(id);
}