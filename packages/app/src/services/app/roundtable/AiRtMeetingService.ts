import {useSql} from "@/lib/sql.ts";
import type {AiRtMeeting, AiRtMeetingAdd} from "@/entity/app/ai/roundtable";

export async function listAiRtMeetingService(groupId: string) {
  return useSql().query<AiRtMeeting>('ai_rt_meeting')
    .eq('group_id', groupId)
    .list();
}

export async function addAiRtMeetingService(meeting: AiRtMeetingAdd) {
  const now = Date.now();
  return useSql().mapper<AiRtMeeting>('ai_rt_meeting').insert({
    ...meeting,
    created_at: now,
    updated_at: now
  });
}