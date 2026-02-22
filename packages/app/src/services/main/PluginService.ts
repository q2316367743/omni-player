import {type ToolItem, type ToolItemTypeOuter} from "@/global/PluginList.ts";
import {usePluginStore} from "@/lib/store.ts";
import {useSnowflake} from "@/util";
import type {UnlistenFn} from "@tauri-apps/api/event";

type ToolList = ToolItem<ToolItemTypeOuter>;

export async function listPlugin(): Promise<Array<ToolList>> {
  const entries = await usePluginStore().entries<ToolList>();
  return entries.map(e => e[1]);
}

export async function addPluginService(data: ToolList) {
  // 设置 ID
  data.id = useSnowflake().nextId();
  data.createdAt = Date.now();
  // 添加
  await usePluginStore().set<ToolList>(data.id, data);
  return data.id;

}

export async function removePlugin(id: string) {
  await usePluginStore().delete(id);
}

let unlistenFn: (undefined | UnlistenFn) = undefined;

export async function onPluginChange(callback: (plugin: Array<ToolList>) => void) {
  unlistenFn?.();
  listPlugin().then(callback);
  unlistenFn = await usePluginStore().onChange(() => {
    listPlugin().then(callback);
  });
}