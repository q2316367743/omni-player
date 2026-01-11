import type {ReleaseVersion} from "@/entity/release/ReleaseVersion.ts";
import {useSql} from "@/lib/sql.ts";

export async function listReleaseVersionService(projectId: string) {
  return useSql().query<ReleaseVersion>('release_version').eq('project_id', projectId).list();
}