import type {SpLog, SpLogCore} from "@/entity/screenplay/SpLog.ts";
import {useSql} from "@/lib/sql.ts";

export function listSpLogService(screenplayId: string) {
  return useSql().query<SpLog>('sp_log')
    .eq('screenplay_id', screenplayId).list();
}

export function addSpLogService(prop: SpLogCore) {
  const now = Date.now();
  return useSql().mapper<SpLog>('sp_log').insert({
    ...prop,
    created_at: now,
    updated_at: now
  });
}
