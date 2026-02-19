import {useAiRtSql} from "@/lib/sql.ts";
import type {
  AiRtMeeting,
  AiRtMeetingAdd,
  AiRtMeetingCore,
  AiRtMessage,
  AiRtParticipant
} from "@/entity/app/ai/roundtable";

export async function listAiRtMeetingService(groupId: string) {
  return useAiRtSql().query<AiRtMeeting>('ai_rt_meeting')
    .eq('group_id', groupId)
    .list();
}

export function getAiRtMeetingService(id: string) {
  return useAiRtSql().query<AiRtMeeting>('ai_rt_meeting').eq('id', id).one();
}

export function updateAiRtMeetingService(id: string, meeting: Partial<AiRtMeetingCore>) {
  return useAiRtSql().mapper<AiRtMeeting>('ai_rt_meeting').updateById(id, {
    ...meeting,
    updated_at: Date.now()
  })
}

export async function deleteAiRtMeetingService(id: string) {
  // 删除自身
  await useAiRtSql().mapper<AiRtMeeting>('ai_rt_meeting').deleteById(id);
  // 删除参与者
  await useAiRtSql().query<AiRtParticipant>('ai_rt_participant').eq('scope', 'meeting').eq('scope_id', id).delete();
  // 删除聊天消息
  await useAiRtSql().query<AiRtMessage>('ai_rt_message').eq('meeting_id', id).delete();
}

export async function addAiRtMeetingService(meeting: AiRtMeetingAdd) {
  const now = Date.now();
  // 创建 会议
  const {id} = await useAiRtSql().mapper<AiRtMeeting>('ai_rt_meeting').insert({
    group_id: meeting.group_id,
    topic: meeting.topic,
    content: meeting.content,
    status: 'active',
    auto_summary_on_end: meeting.auto_summary_on_end,
    max_rounds: meeting.max_rounds,
    summary_interval: meeting.summary_interval,
    user_role: meeting.user_role,
    created_at: now,
    updated_at: now
  });
  // 创建 会议 参与者
  try {
    await useAiRtSql().mapper<AiRtParticipant>('ai_rt_participant').insertBatch(
      meeting.participants.map((participant, i) => ({
        ...participant,
        join_order: i + 1,
        scope: "meeting",
        scope_id: id,
        created_at: now,
        updated_at: now
      })));
  } catch (e) {
    await useAiRtSql().mapper<AiRtMeeting>('ai_rt_meeting').deleteById(id);
    throw e;
  }
  return id;
}