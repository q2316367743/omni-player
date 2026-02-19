import {useSql} from "@/lib/sql.ts";
import type {PluginEntity} from "@/entity/main/PluginEntity.ts";

export function listPlugin() {
  return useSql().query<PluginEntity>('plugin')
    .list();
}