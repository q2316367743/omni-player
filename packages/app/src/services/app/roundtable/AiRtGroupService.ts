import type {AiRtGroup, AiRtGroupCore} from "@/entity/app/ai/roundtable";
import {useSql} from "@/lib/sql.ts";

export function listAiRtGroupService() {
  return useSql().query<AiRtGroup>('ai_rt_group').list();
}

export function getAiRtGroupService(id: string) {
  return useSql().query<AiRtGroup>('ai_rt_group').eq('id', id).one();
}

export function addAiRtGroupService(group: AiRtGroupCore) {
  const now = Date.now();
  return useSql().mapper<AiRtGroup>('ai_rt_group').insert({
    ...group,
    created_at: now,
    updated_at: now
  });
}

export function updateAiRtGroupService(id: string, group: Partial<AiRtGroupCore>) {
  return useSql().mapper<AiRtGroup>('ai_rt_group').updateById(id, {
    ...group,
    updated_at: Date.now()
  });
}

export async function deleteAiRtGroupService(id: string) {
  await useSql().mapper<AiRtGroup>('ai_rt_group').deleteById(id);
}