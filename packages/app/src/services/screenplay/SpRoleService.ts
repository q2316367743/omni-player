import type {SpRole, SpRoleCore, SpRoleType} from "@/entity/screenplay";
import {useSpSql} from "@/lib/sql.ts";

export function listSpRoleService(screenplayId: string, type?: SpRoleType) {
  return useSpSql().query<SpRole>('sp_role')
    .eq('screenplay_id', screenplayId)
    .eq('type', type)
    .list();
}

export function addSpRoleService(prop: SpRoleCore) {
  const now = Date.now();
  return useSpSql().mapper<SpRole>('sp_role').insert({
    ...prop,
    created_at: now,
    updated_at: now
  });
}

export function updateSpRoleService(id: string, prop: Partial<SpRoleCore>) {
  const now = Date.now();
  return useSpSql().mapper<SpRole>('sp_role').updateById(id, {
    ...prop,
    updated_at: now
  });
}

export async function deleteSpRoleService(id: string) {
  // 删除角色
  await useSpSql().mapper<SpRole>('sp_role').deleteById(id);
  // TODO: 删除角色相关信息，此处需要校验，已经发过言的不应该删除

}