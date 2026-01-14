import {useSql} from "@/lib/sql.ts";
import type {AiRtRole, AiRtRoleAdd, AiRtRoleUpdate} from "@/entity/app/ai/roundtable";

export function listAiRtRoleService() {
  return useSql().query<AiRtRole>('ai_rt_role').list()
}

export function addAiRtRoleService(prop: AiRtRoleAdd) {
  const now = Date.now();
  return useSql().mapper<AiRtRole>('ai_rt_role').insert({
    ...prop,
    created_at: now,
    updated_at: now
  })
}

export function updateAiRtRoleService(id: string, prop: Partial<AiRtRoleUpdate>) {
  return useSql().mapper<AiRtRole>('ai_rt_role').updateById(id, {
    ...prop,
    updated_at: Date.now()
  })
}

export function deleteAiRtRoleService(id: string) {
  return useSql().mapper<AiRtRole>('ai_rt_role').deleteById(id)
}