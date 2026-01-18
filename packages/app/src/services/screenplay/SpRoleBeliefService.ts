import type {SpRoleBelief, SpRoleBeliefCore} from "@/entity/screenplay";
import {useSql} from "@/lib/sql.ts";

export function listSpRoleBeliefService(screenplayId: string, roleId?: string, isActive?: number) {
  return useSql().query<SpRoleBelief>('sp_role_belief')
    .eq('screenplay_id', screenplayId)
    .eq('role_id', roleId)
    .eq('is_active', isActive)
    .list();
}

export function addSpRoleBeliefService(prop: SpRoleBeliefCore) {
  const now = Date.now();
  return useSql().mapper<SpRoleBelief>('sp_role_belief').insert({
    ...prop,
    created_at: now,
    updated_at: now
  })
}

export function retractSpRoleBeliefService(id: string) {
  return useSql().mapper<SpRoleBelief>('sp_role_belief').updateById(id, {
    is_active: 0
  })
}