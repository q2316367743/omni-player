import type {SpDialogue, SpDialogueCore} from "@/entity/screenplay";
import {useSpSql} from "@/lib/sql.ts";

export function listSpDialogueService(screenplayId: string, sceneId: string) {
  return useSpSql().query<SpDialogue>('sp_dialogue')
    .eq('screenplay_id', screenplayId)
    .eq('scene_id', sceneId)
    .list();
}

export async function addSpDialogueService(prop: SpDialogueCore) {
  const now = Date.now();
  const last = await useSpSql().query<SpDialogue>('sp_dialogue')
    .select('turn_order')
    .eq('screenplay_id', prop.screenplay_id)
    .eq('scene_id', prop.scene_id)
    .orderByDesc('turn_order')
    .get();
  return useSpSql().mapper<SpDialogue>('sp_dialogue').insert({
    ...prop,
    turn_order: (last?.turn_order || 0) + 1,
    created_at: now,
    updated_at: now,
  });
}