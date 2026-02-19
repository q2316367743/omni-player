import type {AiRtParticipant, AiRtParticipantCore, AiRtRelatedRoleScope} from "@/entity/app/ai/roundtable";
import {useAiRtSql} from "@/lib/sql.ts";

export function listAiRtParticipantService(scope: AiRtRelatedRoleScope, scopeId: string) {
  return useAiRtSql().query<AiRtParticipant>('ai_rt_participant')
    .eq('scope', scope)
    .eq('scope_id', scopeId)
    .list();
}

export function getAiRtParticipantService(id: string) {
  return useAiRtSql().query<AiRtParticipant>('ai_rt_participant')
    .eq('id', id)
    .one();
}

export function updateAiRtParticipantService(id: string, data: Partial<AiRtParticipantCore>) {
  return useAiRtSql().mapper<AiRtParticipant>('ai_rt_participant').updateById(id, data);
}