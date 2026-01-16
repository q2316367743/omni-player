import type {Screenplay, ScreenplayCoreView} from "@/entity/screenplay";
import {useSql} from "@/lib/sql.ts";

export function listScreenplayService() {
  return useSql().query<Screenplay>('screenplay').list();
}

export function addScreenplayService(prop: ScreenplayCoreView) {
  const now = Date.now();
  return useSql().mapper<Screenplay>('screenplay')
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
  return useSql().mapper<Screenplay>('screenplay')
    .updateById(id, {
      title: prop.title,
      background: prop.background,
      tags: prop.tags?.join(","),
      updated_at: now,
    })
}
export function deleteScreenplayService(id: string) {
  return useSql().mapper<Screenplay>('screenplay').deleteById(id);
}