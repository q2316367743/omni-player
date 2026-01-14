import {useSql} from "@/lib/sql.ts";
import type {AiRtMeeting, AiRtMeetingAdd, AiRtMeetingCore, AiRtParticipant} from "@/entity/app/ai/roundtable";

export async function listAiRtMeetingService(groupId: string) {
  return useSql().query<AiRtMeeting>('ai_rt_meeting')
    .eq('group_id', groupId)
    .list();
}

export function getAiRtMeetingService(id: string) {
  return useSql().query<AiRtMeeting>('ai_rt_meeting').eq('id', id).one();
}

export function updateAiRtMeetingService(id: string, meeting: Partial<AiRtMeetingCore>) {
  return useSql().mapper<AiRtMeeting>('ai_rt_meeting').updateById(id, {
    ...meeting,
    updated_at: Date.now()
  })
}

export async function addAiRtMeetingService(meeting: AiRtMeetingAdd) {
  const now = Date.now();
  // 创建 会议
  return useSql().beginTransaction(async sql => {
    const {id} = await sql.mapper<AiRtMeeting>('ai_rt_meeting').insert({
      group_id: meeting.group_id,
      topic: meeting.topic,
      content: meeting.content,
      status: 'active',
      allow_user_interruption: meeting.allow_user_interruption,
      auto_summary_on_end: meeting.auto_summary_on_end,
      max_rounds: meeting.max_rounds,
      summary_interval: meeting.summary_interval,
      created_at: now,
      updated_at: now
    });
    // 创建 会议 参与者
    await sql.mapper<AiRtParticipant>('ai_rt_participant').insertBatch(
      meeting.participants.map((participant, i) => ({
        ...participant,
        join_order: i + 1,
        scope: "meeting",
        scope_id: id,
        created_at: now,
        updated_at: now
      })));
    return id;
  })
}