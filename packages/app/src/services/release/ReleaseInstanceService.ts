import {useMpSql} from "@/lib/sql.ts";
import type {ReleaseInstance, ReleaseInstanceCore} from "@/entity/app/release";

export async function listReleaseInstanceService(projectId: string) {
  return useMpSql().query<ReleaseInstance>('release_instance').eq('project_id', projectId).list();
}

export async function getReleaseInstanceService(id: string, projectId: string) {
  return useMpSql().query<ReleaseInstance>('release_instance').eq('id', id).eq('project_id', projectId).one();
}

export async function addReleaseInstanceService(projectId: string, instance: Partial<ReleaseInstanceCore>) {
  return useMpSql().mapper<ReleaseInstance>('release_instance').insert({
    ...instance,
    current_version_id: '',
    project_id: projectId,
    created_at: Date.now(),
    updated_at: Date.now()
  });
}

export async function updateReleaseInstanceService(id: string, instance: Partial<ReleaseInstanceCore & {
  current_version_id: string
}>) {
  return useMpSql().mapper<ReleaseInstance>('release_instance').updateById(id, {
    name: instance.name,
    desc: instance.desc,
    current_version_id: instance.current_version_id,
    updated_at: Date.now()
  });
}

export async function deleteReleaseInstanceService(id: string) {
  return useMpSql().mapper<ReleaseInstance>('release_instance').deleteById(id);
}

