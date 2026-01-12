import {useSql} from "@/lib/sql.ts";
import type {ReleaseVersionLog} from "@/entity/release/ReleaseVersionLog.ts";

export function listReleaseVersionLog(ids: Array<string>) {
  return useSql().query<ReleaseVersionLog>('release_version_log')
    .in('id', ids)
    .list();
}