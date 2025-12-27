import {open, save} from '@tauri-apps/plugin-dialog';
import {readTextFile, writeTextFile} from '@tauri-apps/plugin-fs';
import {useNetworkServerStore} from "@/store";
import {parseJsonWithBigIntSupport, stringifyJsonWithBigIntSupport} from "@/util";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {checkNetworkFormat, checkNetworkType} from "@/entity/NetworkServer.ts";


async function _exportNetwork() {
  // 选择文件
  const path = await save({
    title: '导出网络资源',
    defaultPath: '网络资源.json',
    filters: [
      {
        name: 'JSON文件',
        extensions: ['json']
      }
    ]
  });
  if (!path) return Promise.reject(new Error("请选择文件"));
  const {servers} = useNetworkServerStore();
  const json = stringifyJsonWithBigIntSupport(servers);
  await writeTextFile(path, json);
}

export function exportNetwork() {
  _exportNetwork().then(() => {
    MessageUtil.success("导出成功");
  }).catch(e => {
    MessageUtil.error("导出失败", e)
  })
}

async function _importNetwork() {
  const path = await open({
    title: '导入网络资源',
    multiple: false,
    filters: [
      {
        name: 'JSON文件',
        extensions: ['json']
      }
    ]
  });
  if (!path) return Promise.reject(new Error("请选择文件"));
  const json = await readTextFile(path);
  const items = parseJsonWithBigIntSupport(json);
  if (!Array.isArray(items)) return Promise.reject(new Error("请选择正确的文件"));
  for (const index in items) {
    const item = items[index];
    if (!item.name) {
      MessageUtil.warning(`第 ${index} 条导入失败，资源名称不存在`)
      continue;
    }
    if (!item.url) {
      MessageUtil.warning(`第 ${index} 条导入失败，资源链接不存在`)
      continue;
    }
    if (!checkNetworkType(item.type)) {
      MessageUtil.warning(`第 ${index} 条导入失败，资源类型错误`)
      continue;
    }
    if (!checkNetworkFormat(item.format)) {
      MessageUtil.warning(`第 ${index} 条导入失败，资源 格式错误`)
      continue;
    }
    await useNetworkServerStore().addServer(item);
  }

}

export function importNetwork() {
  _importNetwork().then(() => {
    MessageUtil.success("导入成功");
  }).catch(e => {
    MessageUtil.error("导入失败", e)
  })
}