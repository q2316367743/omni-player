import type {SpDialogue, SpDirectorInstructionLog, SpDirectorInstructionLogCore} from "@/entity/screenplay";
import {useSql} from "@/lib/sql.ts";

export function listSpDilService(
  screenplayId: string,
  sceneId: string
): Promise<SpDirectorInstructionLog[]> {
  return useSql().query<SpDirectorInstructionLog>('sp_director_instruction_log')
    .eq('screenplay_id', screenplayId)
    .eq('scene_id', sceneId)
    .list();
}

export async function addSpDilService(
  prop: SpDirectorInstructionLogCore
) {
  const now = Date.now();
  const last = await useSql().query<SpDialogue>('sp_dialogue')
    .select('id')
    .eq('screenplay_id', prop.screenplay_id)
    .eq('scene_id', prop.scene_id)
    .orderByDesc('turn_order')
    .get();
  return useSql().mapper<SpDirectorInstructionLog>('sp_director_instruction_log').insert({
    ...prop,
    dialogue_id: last?.id || '',
    created_at: now,
    updated_at: now
  });
}

export function updateSpDilService(id: string, data: Partial<SpDirectorInstructionLog>) {
  return useSql().mapper<SpDirectorInstructionLog>('sp_director_instruction_log').updateById(id, {
    ...data,
    updated_at: Date.now()
  });
}
