import {useSql} from "@/lib/sql.ts";
import type {AiChatGroup, AiChatItem, AiChatItemCore, AiChatMessage} from "@/entity/app/ai/chat";

export async function listAiChatItemService(groupId = "") {
  return useSql().query<AiChatItem>('ai_chat_item')
    .eq('group_id', groupId)
    .orderByDesc('top')
    .orderByDesc('sort')
    .list();
}

export async function getAiChatItemService(id: string) {
  return useSql().query<AiChatItem>('ai_chat_item').eq('id', id).one();
}

export async function moveAiChatItemService(id: string, groupId: string) {
  await useSql().mapper<AiChatItem>('ai_chat_item').updateById(id, {
    group_id: groupId,
    updated_at: Date.now(),
  })
}

export async function searchAiChatItemService(keyword: string, groupId = "") {
  return useSql().query<AiChatItem>('ai_chat_item').like('name', keyword).eq('group_id', groupId).orderByDesc('top').list();
}

export async function updateAiChatItemService(id: string, core: Partial<AiChatItemCore>) {
  return useSql().mapper<AiChatItem>('ai_chat_item').updateById(id, {
    ...core,
    updated_at: Date.now(),
  });
}

export async function removeAiChatItemService(id: string) {
  await Promise.all([
    useSql().mapper<AiChatItem>('ai_chat_item').deleteById(id),
    useSql().query<AiChatMessage>('ai_chat_message').eq('chat_id', id).delete()
  ])
}

/**
 * 创建一个聊天记录
 * @param groupId 所属分组
 * @param message 内容
 * @param model 模型
 * @param think 是否思考
 * @returns 聊天项ID
 */
export async function createAiChatItemService(groupId: string, message: string, model: string, think: boolean) {
  const sql = useSql();
  const now = Date.now();
  // 创建聊天记录
  const chat = await sql.mapper<AiChatItem>('ai_chat_item').insert({
    group_id: groupId,
    name: message.substring(0, 10),
    top: 0,
    sort: now,
    created_at: now,
    updated_at: now
  })
  let idx = 0;
  if (groupId) {
    //获取分组
    const group = await sql.query<AiChatGroup>('ai_chat_group')
      .eq('id', groupId).one();
    if (group) {
      // 插入提示词
      await sql.mapper<AiChatMessage>('ai_chat_message').insert({
        chat_id: chat.id,
        role: 'system',
        model: model,
        content: group.prompt,
        created_at: now,
        updated_at: now,
        index: 0,
        think: think ? 1 : 0
      });
      idx = 1;
    }
  }
  // 插入问题
  await sql.mapper<AiChatMessage>('ai_chat_message').insert({
    chat_id: chat.id,
    role: 'user',
    content: message,
    model: model,
    created_at: now,
    updated_at: now,
    index: idx
  });
  // 返回 ID
  return chat.id;
}