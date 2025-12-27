import {open, save} from '@tauri-apps/plugin-dialog';
import {readTextFile, writeTextFile} from '@tauri-apps/plugin-fs';
import {export2Opml, importByOpml} from "@/util/file/opml.ts";
import {addSubscribe, listSubscribe} from "@/services";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";

async function _importSubscribe() {
  // 选择文件
  const path = await open({
    multiple: false,
    title: '选择订阅文件',
    filters: [
      {
        name: 'OPML',
        extensions: ['opml']
      }
    ]
  });
  if (!path) return Promise.reject(new Error("请选择文件"));
  const opml = await readTextFile(path);
  const items = importByOpml(opml);
  for (const item of items) {
    await addSubscribe(item);
  }
}

export function importSubscribe() {
  _importSubscribe().then(() => {
    MessageUtil.success("导入成功");
    useSubscribeStore().refresh();
  }).catch(e => {
    MessageUtil.error("导入失败", e)
  })
}

async function _exportSubscribe() {
  const path = await save({
    title: '导出订阅文件',
    defaultPath: '订阅.opml',
    filters: [
      {
        name: 'OPML',
        extensions: ['opml']
      }
    ]
  });
  if (!path) return Promise.reject(new Error("请选择文件保存位置"));
  const items = await listSubscribe();
  const opml = export2Opml(items);
  await writeTextFile(path, opml);
}

export async function exportSubscribe() {
  _exportSubscribe().then(() => {
    MessageUtil.success("导出成功");
  }).catch(e => {
    MessageUtil.error("导出失败", e)
  })
}