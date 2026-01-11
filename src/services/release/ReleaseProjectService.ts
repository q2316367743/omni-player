import {useSql} from "@/lib/sql.ts";
import type {ReleaseProject, ReleaseProjectCore} from "@/entity/release/ReleaseProject.ts";
import type {ReleaseVersion} from "@/entity/release/ReleaseVersion.ts";

export async function listReleaseProject() {
  const query = useSql().query<ReleaseProject>('release_project');
  return query.list();
}

export async function addReleaseProject(project: ReleaseProjectCore) {
  const mapper = useSql().mapper<ReleaseProject>('release_project');
  return mapper.insert({
    ...project,
    created_at: Date.now(),
    updated_at: Date.now()
  });
}

export async function updateReleaseProject(id: string, project: Partial<ReleaseProject>) {
  const mapper = useSql().mapper<ReleaseProject>('release_project');
  return mapper.updateById(id, {
    ...project,
    updated_at: Date.now()
  });
}

export async function deleteReleaseProject(id: string) {
  await useSql().beginTransaction(async sql => {
    const mapper = sql.mapper<ReleaseProject>('release_project');
    // 删除基础信息
    await mapper.deleteById(id);
    await sql.query<ReleaseVersion>('release_version').eq('project_id', id).delete();
    await sql.query<ReleaseVersion>('release_instance').eq('project_id', id).delete();
    await sql.query<ReleaseVersion>('release_deploy').eq('project_id', id).delete();
    await sql.query<ReleaseVersion>('release_version_log').eq('project_id', id).delete();
    await sql.query<ReleaseVersion>('release_asset_content').eq('project_id', id).delete();
    await sql.query<ReleaseVersion>('release_asset_meta').eq('project_id', id).delete();
  })
}