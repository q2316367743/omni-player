import type {ReleaseVersion, ReleaseVersionCore} from "@/entity/release/ReleaseVersion.ts";
import {useSql} from "@/lib/sql.ts";

export async function listReleaseVersionService(projectId: string) {
  return useSql().query<ReleaseVersion>('release_version').eq('project_id', projectId).list();
}

export async function getReleaseVersionService(id: string, projectId: string) {
  return useSql().query<ReleaseVersion>('release_version').eq('id', id).eq('project_id', projectId).one();
}

export async function addReleaseVersionService(projectId: string, version: Partial<ReleaseVersionCore>) {
  return useSql().mapper<ReleaseVersion>('release_version').insert({
    ...version,
    project_id: projectId,
    created_at: Date.now(),
    updated_at: Date.now()
  });
}

export async function updateReleaseVersionService(id: string, version: Partial<ReleaseVersionCore>) {
  return useSql().mapper<ReleaseVersion>('release_version').updateById(id, {
    version: version.version,
    deploy_time: version.deploy_time,
    deploy_user: version.deploy_user,
    updated_at: Date.now()
  });
}

export async function deleteReleaseVersionService(id: string) {
  return useSql().mapper<ReleaseVersion>('release_version').deleteById(id);
}