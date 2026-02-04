import {useSql} from "@/lib/sql.ts";
import type {McpSetting, McpSettingCore} from "@/entity/setting";

export function listMcpSetting() {
  return useSql().query<McpSetting>('mcp_setting').list()
}

export function addMcpSetting(data: McpSettingCore) {
  const now = Date.now();
  return useSql().mapper<McpSetting>('mcp_setting').insert({
    ...data,
    created_at: now,
    updated_at: now
  })
}

export function updateMcpSetting(id: string, data: Partial<McpSettingCore>) {
  const now = Date.now();
  return useSql().mapper<McpSetting>('mcp_setting').updateById(id, {
    ...data,
    updated_at: now
  })
}

export function deleteMcpSetting(id: string) {
  return useSql().mapper<McpSetting>('mcp_setting').deleteById(id)
}