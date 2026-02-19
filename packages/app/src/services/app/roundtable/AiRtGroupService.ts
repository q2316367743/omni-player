import type {AiRtGroup, AiRtGroupCore} from "@/entity/app/ai/roundtable";
import {useAiRtSql} from "@/lib/sql.ts";

export function listAiRtGroupService() {
  return useAiRtSql().query<AiRtGroup>('ai_rt_group').list();
}

export function getAiRtGroupService(id: string) {
  return useAiRtSql().query<AiRtGroup>('ai_rt_group').eq('id', id).one();
}

export function addAiRtGroupService(group: AiRtGroupCore) {
  const now = Date.now();
  return useAiRtSql().mapper<AiRtGroup>('ai_rt_group').insert({
    ...group,
    created_at: now,
    updated_at: now
  });
}

export function updateAiRtGroupService(id: string, group: Partial<AiRtGroupCore>) {
  return useAiRtSql().mapper<AiRtGroup>('ai_rt_group').updateById(id, {
    ...group,
    updated_at: Date.now()
  });
}

export async function deleteAiRtGroupService(id: string) {
  await useAiRtSql().mapper<AiRtGroup>('ai_rt_group').deleteById(id);
}