import type {ReleaseVersion, ReleaseVersionCore, ReleaseVersionLog} from "@/entity/app/release";
import {useMpSql} from "@/lib/sql.ts";

export async function listReleaseVersionService(projectId: string) {
  return useMpSql().query<ReleaseVersion>('release_version')
    .eq('project_id', projectId)
    .orderByAsc('publish_time')
    .list();
}

export async function getReleaseVersionService(id: string, projectId: string) {
  return useMpSql().query<ReleaseVersion>('release_version').eq('id', id).eq('project_id', projectId).one();
}

export async function addReleaseVersionService(projectId: string, version: Partial<ReleaseVersionCore>) {
  const {id} = await useMpSql().mapper<ReleaseVersion>('release_version').insert({
    ...version,
    project_id: projectId,
    created_at: Date.now(),
    updated_at: Date.now()
  });
  await useMpSql().mapper<ReleaseVersionLog>('release_version_log').insertSelf({
    project_id: projectId,
    id,
    content: '',
  })
}

export async function updateReleaseVersionService(id: string, version: Partial<ReleaseVersionCore>) {
  return useMpSql().mapper<ReleaseVersion>('release_version').updateById(id, {
    version: version.version,
    publish_time: version.publish_time,
    publish_user: version.publish_user,
    updated_at: Date.now()
  });
}

export async function deleteReleaseVersionService(id: string) {
  return useMpSql().mapper<ReleaseVersion>('release_version').deleteById(id);
}

interface ReleaseVersionDeployProp {
  projectId: string;
  deployTimeStart: number;
  deployTimeEnd: number;

}

export async function listReleaseVersionDeploy(props: ReleaseVersionDeployProp) {
  return useMpSql().query<ReleaseVersion>('release_version')
    .eq('project_id', props.projectId)
    .ge('publish_time', props.deployTimeStart)
    .le('publish_time', props.deployTimeEnd)
    .orderByAsc('publish_time')
    .list();
}