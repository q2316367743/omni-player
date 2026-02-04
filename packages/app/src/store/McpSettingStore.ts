import {
  buildMcpSettingView,
  buildMcpViewToCoreAdd,
  buildMcpViewToCoreUpdate,
  type McpSettingView,
  type McpSettingViewCore
} from "@/entity/setting";
import {defineStore} from "pinia";
import {addMcpSetting, deleteMcpSetting, listMcpSetting, updateMcpSetting} from "@/services/McpService.ts";
import {list, add, remove} from '@tauri-apps/plugin-mcp';
import {logDebug, logError} from "@/lib/log.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";

export const useMcpSettingStore = defineStore('mcp-setting', () => {
  const mcps = ref(new Array<McpSettingView>());

  async function fetchMcps() {
    const m = await listMcpSetting();
    mcps.value = m.map(e => buildMcpSettingView(e));
    try {
      const e = await list();
      // 所有启用的
      const me = mcps.value.filter(e => e.is_enabled);
      // 如果启用但没启动
      for (const meElement of me) {
        if (!e.includes(meElement.id)) {
          // 启动
          await add([{
            id: meElement.id,
            name: meElement.label,
            args: meElement.args,
            command: meElement.command,
            env: meElement.env,
          }])
        }
      }
      // 启动但没有启用
      for (const eElement of e) {
        if (!mcps.value.some(m=> m.id === eElement)) {
          // 停止
          await remove([eElement])
        }
      }
      mcps.value.filter(m=> e.includes(m.id))
    } catch (e) {
      logError('[McpSettingStore] Failed to list mcp:', e);
      MessageUtil.error('Failed to list mcp', e);
    }
    logDebug('[McpSettingStore] fetchList success');
  }

  async function addMcp(data: McpSettingViewCore) {
    await addMcpSetting(buildMcpViewToCoreAdd(data));
    await fetchMcps();
  }

  async function updateMcp(id: string, data: Partial<McpSettingViewCore>) {
    await updateMcpSetting(id, buildMcpViewToCoreUpdate(data));
    await fetchMcps();
  }

  async function deleteMcp(id: string) {
    await deleteMcpSetting(id);
    await fetchMcps();
  }

  return {
    mcps,
    fetchMcps, addMcp, updateMcp, deleteMcp
  }
})