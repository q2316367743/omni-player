import type {SpLog, SpLogCore} from "@/entity/screenplay/SpLog.ts";
import {useSpSql} from "@/lib/sql.ts";

export function listSpLogService(screenplayId: string) {
  return useSpSql().query<SpLog>('sp_log')
    .eq('screenplay_id', screenplayId).list();
}

export function addSpLogService(prop: SpLogCore) {
  const now = Date.now();
  return useSpSql().mapper<SpLog>('sp_log').insert({
    ...prop,
    created_at: now,
    updated_at: now
  });
}
