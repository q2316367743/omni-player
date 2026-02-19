import type {Screenplay, ScreenplayCoreView} from "@/entity/screenplay";
import {useSpSql} from "@/lib/sql.ts";

export function listScreenplayService() {
  return useSpSql().query<Screenplay>('screenplay').list();
}

export function getScreenplayService(id: string) {
  return useSpSql().query<Screenplay>('screenplay').eq('id', id).get();
}

export function addScreenplayService(prop: ScreenplayCoreView) {
  const now = Date.now();
  return useSpSql().mapper<Screenplay>('screenplay')
    .insert({
      title: prop.title,
      background: prop.background,
      tags: prop.tags.join(","),
      created_at: now,
      updated_at: now,
    })
}

export function updateScreenplayService(id: string, prop: Partial<ScreenplayCoreView>) {
  const now = Date.now();
  return useSpSql().mapper<Screenplay>('screenplay')
    .updateById(id, {
      title: prop.title,
      background: prop.background,
      tags: prop.tags?.join(","),
      updated_at: now,
    })
}
export function deleteScreenplayService(id: string) {
  return useSpSql().mapper<Screenplay>('screenplay').deleteById(id);
}