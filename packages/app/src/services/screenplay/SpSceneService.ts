import type {SpScene, SpSceneCore} from "@/entity/screenplay";
import {useSql} from "@/lib/sql.ts";

export function listSpSceneService(screenplayId: string) {
  return useSql().query<SpScene>('sp_scene').eq('screenplay_id', screenplayId).list();
}

export function getSpSceneService(id: string) {
  return useSql().query<SpScene>('sp_scene').eq('id', id).get();
}

export async function addSpSceneService(prop: SpSceneCore) {
  const last = await useSql().query<SpScene>('sp_scene')
    .select('order_index')
    .eq('screenplay_id', prop.screenplay_id)
    .orderByDesc('order_index')
    .get();
  const now = Date.now();
  return useSql().mapper<SpScene>('sp_scene').insert({
    ...prop,
    created_at: now,
    updated_at: now,
    order_index: (last?.order_index || 0) + 1
  });
}

export async function updateSpSceneService(id: string, prop: SpSceneCore) {
  const now = Date.now();
  return useSql().mapper<SpScene>('sp_scene').updateById(id, {
    ...prop,
    updated_at: now
  });
}

export function deleteSpSceneService(id: string) {
  return useSql().mapper<SpScene>('sp_scene').deleteById(id);
}