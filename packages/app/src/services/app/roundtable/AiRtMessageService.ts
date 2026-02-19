import type {AiRtMessage, AiRtMessageCore} from "@/entity/app/ai/roundtable";
import {useAiRtSql} from "@/lib/sql.ts";

export async function addAiRtMessageService(meetingId: string, message: AiRtMessageCore) {
  const count = await useAiRtSql().query<AiRtMessage>('ai_rt_message')
    .eq('meeting_id', meetingId)
    .select('turn_order')
    .orderByDesc('turn_order')
    .one();
  const sql = useAiRtSql();
  const {id} = await sql.mapper<AiRtMessage>('ai_rt_message').insert({
    ...message,
    meeting_id: meetingId,
    created_at: Date.now(),
    updated_at: Date.now(),
    turn_order: (count?.turn_order || 0) + 1,
  });
  return id;
}

export function listAiRtMessageService(messageId: string) {
  return useAiRtSql().query<AiRtMessage>('ai_rt_message')
    .eq('meeting_id', messageId)
    .orderByAsc('turn_order')
    .list();
}

export function updateAiRtMessageService(id: string, message: Partial<AiRtMessageCore>) {
  return useAiRtSql().mapper<AiRtMessage>('ai_rt_message').updateById(id, message);
}