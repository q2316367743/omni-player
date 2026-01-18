import type {SpRoleAppearance, SpRoleAppearanceCore} from "@/entity/screenplay/SpRoleAppearance.ts";
import {useSql} from "@/lib/sql.ts";
import type {SpDialogue} from "@/entity/screenplay";

export function listSpRoleAppearanceService(screenplayId: string, sceneId?: string) {
  return useSql().query<SpRoleAppearance>('sp_role_appearance')
    .eq('screenplay_id', screenplayId)
    .eq('scene_id', sceneId)
    .list();
}

export async function addSpRoleAppearanceService(prop: SpRoleAppearanceCore) {
  const now = Date.now();
  const last = await useSql().query<SpDialogue>('sp_dialogue')
    .select('turn_order')
    .eq('screenplay_id', prop.screenplay_id)
    .eq('scene_id', prop.scene_id)
    .orderByDesc('turn_order')
    .get();
  return useSql().mapper<SpRoleAppearance>('sp_role_appearance').insert({
    ...prop,
    enter_turn: (last?.turn_order || 0),
    exit_turn: 0,
    created_at: now,
    updated_at: now,
  });
}

export async function retractSpRoleAppearanceService(id: string, screenplayId: string, sceneId: string) {
  const now = Date.now();
  const last = await useSql().query<SpDialogue>('sp_dialogue')
    .select('turn_order')
    .eq('screenplay_id', screenplayId)
    .eq('scene_id', sceneId)
    .orderByDesc('turn_order')
    .get();
  return useSql().mapper<SpRoleAppearance>('sp_role_appearance').updateById(id, {
    exit_turn: last?.turn_order || 0,
    is_active: 0,
    updated_at: now,
  });
}