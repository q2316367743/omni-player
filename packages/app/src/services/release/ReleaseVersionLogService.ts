import {useMpSql} from "@/lib/sql.ts";
import type {ReleaseVersionLog} from "@/entity/app/release";

export function listReleaseVersionLog(ids: Array<string>) {
  return useMpSql().query<ReleaseVersionLog>('release_version_log')
    .in('id', ids)
    .list();
}

export async function getReleaseVersionLog(id: string): Promise<ReleaseVersionLog> {
  const one = await useMpSql().query<ReleaseVersionLog>('release_version_log').eq('id', id).one();
  return one!;
}

export function saveReleaseVersionLog(id: string, content: string) {
  return useMpSql().mapper<ReleaseVersionLog>('release_version_log').updateById(id, {content});
}