import type {AiRtMessage, AiRtMessageCore} from "@/entity/app/ai/roundtable";
import {useSql} from "@/lib/sql.ts";

export async function addAiRtMessageService(meetingId: string, message: AiRtMessageCore) {
  const count = await useSql().query<AiRtMessage>('ai_rt_message').eq('meeting_id', meetingId).count();
  const sql = useSql();
  const {id} = await sql.mapper<AiRtMessage>('ai_rt_message').insert({
    ...message,
    meeting_id: meetingId,
    created_at: Date.now(),
    updated_at: Date.now(),
    turn_order: count,
  });
  return id;
}

export function listAiRtMessageService(messageId: string) {
  return useSql().query<AiRtMessage>('ai_rt_message')
    .eq('meeting_id', messageId)
    .orderByAsc('turn_order')
    .list();
}

export function updateAiRtMessageService(id: string, message: Partial<AiRtMessageCore>) {
  return useSql().mapper<AiRtMessage>('ai_rt_message').updateById(id, message);
}