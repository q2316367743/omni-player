import {useSql} from "@/lib/sql.ts";
import type {AiRtMessage} from "@/entity/app/ai/roundtable";

export function listAiRtMessageService(messageId: string) {
  return useSql().query<AiRtMessage>('ai_rt_message')
    .eq('meeting_id', messageId)
    .list();
}