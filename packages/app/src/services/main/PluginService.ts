import {useSql} from "@/lib/sql.ts";
import type {PluginEntity} from "@/entity/main/PluginEntity.ts";
import {type ToolItem, type ToolItemTypeOuter, toolToPlugin} from "@/global/PluginList.ts";

export function listPlugin() {
  return useSql().query<PluginEntity>('plugin')
    .list();
}

export function addPluginService(data: ToolItem<ToolItemTypeOuter>) {
  const now = Date.now();
  return useSql().mapper<PluginEntity>('plugin')
    .insert({
      ...toolToPlugin(data),
      created_at: now,
      updated_at: now
    });
}

export function removePlugin(id: string) {
  return useSql().mapper<PluginEntity>('plugin')
    .deleteById(id);
}