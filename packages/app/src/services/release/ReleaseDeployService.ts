import {useMpSql} from "@/lib/sql.ts";
import type {ReleaseDeploy, ReleaseDeployCore} from "@/entity/app/release";

/**
 * 获取发版列表
 * @param projectId 项目 ID
 */
export async function listReleaseDeployService(projectId: string) {
  return useMpSql().query<ReleaseDeploy>('release_deploy').eq('project_id', projectId).list();
}


export async function addReleaseDeployService(prop: ReleaseDeployCore) {
  await useMpSql().mapper<ReleaseDeploy>('release_deploy').insert({
    ...prop,
    created_at: Date.now(),
    updated_at: Date.now(),
  })
}