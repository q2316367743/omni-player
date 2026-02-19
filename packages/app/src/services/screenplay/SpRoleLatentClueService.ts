import type {SpRoleLatentClue, SpRoleLatentClueCore, SpRoleLatentClueStatus} from "@/entity/screenplay";
import {useSpSql} from "@/lib/sql.ts";

export function listSpRoleLatentClueService(screenplayId: string, roleId?: string, status?: SpRoleLatentClueStatus) {
  return useSpSql().query<SpRoleLatentClue>('sp_role_latent_clue')
    .eq('screenplay_id', screenplayId)
    .eq('role_id', roleId)
    .eq('status', status)
    .list();
}

export function addSpRoleLatentClueService(prop: SpRoleLatentClueCore) {
  const now = Date.now();
  return useSpSql().mapper<SpRoleLatentClue>('sp_role_latent_clue').insert({
    ...prop,
    created_at: now,
    updated_at: now
  });
}

export function retractSpRoleLatentClueService(id: string, status: SpRoleLatentClueStatus) {
  return useSpSql().mapper<SpRoleLatentClue>('sp_role_latent_clue').updateById(id, {
    status: status
  });
}