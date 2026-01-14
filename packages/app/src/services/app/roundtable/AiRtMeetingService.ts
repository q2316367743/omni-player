import {useSql} from "@/lib/sql.ts";
import type {AiRtMeeting} from "@/entity/app/ai/roundtable";

export async function listAiRtMeetingService(groupId: string) {
  return useSql().query<AiRtMeeting>('ai_rt_meeting')
    .eq('group_id', groupId)
    .list();
}