import type {AiRtParticipant, AiRtRelatedRoleScope} from "@/entity/app/ai/roundtable";
import {useSql} from "@/lib/sql.ts";

export function listAiRtParticipant(scope: AiRtRelatedRoleScope, scopeId: string) {
  return useSql().query<AiRtParticipant>('ai_rt_participant')
    .eq('scope', scope)
    .eq('scope_id', scopeId)
    .list();
}