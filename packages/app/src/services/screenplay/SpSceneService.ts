import type {SpChapterContent, SpScene, SpSceneCore} from "@/entity/screenplay";
import {useSpSql} from "@/lib/sql.ts";

export function listSpSceneService(screenplayId: string) {
  return useSpSql().query<SpScene>('sp_scene').eq('screenplay_id', screenplayId).list();
}

export function getSpSceneService(id: string) {
  return useSpSql().query<SpScene>('sp_scene').eq('id', id).get();
}

export async function addSpSceneService(prop: SpSceneCore) {
  const last = await useSpSql().query<SpScene>('sp_scene')
    .select('order_index')
    .eq('screenplay_id', prop.screenplay_id)
    .orderByDesc('order_index')
    .get();
  const now = Date.now();
  const {id} = await useSpSql().mapper<SpScene>('sp_scene').insert({
    ...prop,
    created_at: now,
    updated_at: now,
    order_index: (last?.order_index || 0) + 1
  });
  try {
    // 创建场景要同步创建一个场景内容
    await useSpSql().mapper<SpChapterContent>('sp_chapter_content').insert({
      screenplay_id: prop.screenplay_id,
      chapter_id: prop.chapter_id,
      scene_id: id,
      content: '',
    })
  } catch (e) {
    await useSpSql().mapper<SpScene>('sp_scene').deleteById(id);
    throw e;
  }
}

export async function updateSpSceneService(id: string, prop: SpSceneCore) {
  const now = Date.now();
  return useSpSql().mapper<SpScene>('sp_scene').updateById(id, {
    ...prop,
    updated_at: now
  });
}

export function deleteSpSceneService(id: string) {
  return useSpSql().mapper<SpScene>('sp_scene').deleteById(id);
}