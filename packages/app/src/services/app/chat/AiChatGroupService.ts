import {useAiRtSql} from "@/lib/sql.ts";
import type {AiChatGroup, AiChatGroupCore, AiChatItem, AiChatMessage} from "@/entity/app/ai/chat";
import type {TableLike} from "@/util";

export async function listAiChatGroupService() {
  return useAiRtSql().query<AiChatGroup>('ai_chat_group').orderByDesc('sort').list();
}

export async function getAiChatGroupService(id: string) {
  return useAiRtSql().query<AiChatGroup>('ai_chat_group').eq('id', id).one();
}

export async function addAiChatGroupService(core: AiChatGroupCore) {
  return useAiRtSql().mapper<AiChatGroup>('ai_chat_group').insert({
    ...core,
    created_at: Date.now(),
    updated_at: Date.now(),
  });
}

export async function updateAiChatGroupService(id: string, core: Partial<AiChatGroupCore>) {
  return useAiRtSql().mapper<AiChatGroup>('ai_chat_group').updateById(id, {
    ...core,
    updated_at: Date.now(),
  });
}

export async function sortAiChatGroupService(items: Array<TableLike>) {
  await useAiRtSql().beginTransaction(async sql => {
    for (let i = 0; i < items.length; i++) {
      await sql.mapper<AiChatGroup>('ai_chat_group').updateById(items[i]!.id, {sort: i});
    }
  })
}

export async function removeAiChatGroupService(id: string) {
  // 获取全部的聊天
  const chats = await useAiRtSql().query<AiChatItem>('ai_chat_item').eq('group_id', id).select('id').list();
  // 删除本身
  await useAiRtSql().mapper<AiChatGroup>('ai_chat_group').deleteById(id);
  // 删除粗全部的聊天
  await useAiRtSql().query<AiChatItem>('ai_chat_item').eq('group_id', id).delete();
  // 删除全部的聊天记录
  await useAiRtSql().query<AiChatMessage>('ai_chat_message').in('chat_id', chats.map(it => it.id)).delete();
}