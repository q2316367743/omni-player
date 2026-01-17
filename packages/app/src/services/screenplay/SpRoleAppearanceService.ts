import type {SpRoleAppearance, SpRoleAppearanceCore} from "@/entity/screenplay/SpRoleAppearance.ts";
import {useSql} from "@/lib/sql.ts";

export function listSpRoleAppearanceService(screenplayId: string, sceneId?: string) {
  return useSql().query<SpRoleAppearance>('sp_role_appearance')
    .eq('screenplay_id', screenplayId)
    .eq('scene_id', sceneId)
    .list();
}

export function addSpRoleAppearanceService(prop: SpRoleAppearanceCore) {
  const now = Date.now();
  return useSql().mapper<SpRoleAppearance>('sp_role_appearance').insert({
    ...prop,
    created_at: now,
    updated_at: now,
  });
}