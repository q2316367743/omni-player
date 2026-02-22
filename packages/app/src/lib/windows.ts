import {WebviewWindow} from "@tauri-apps/api/webviewWindow";
import {getCurrentWindow} from "@tauri-apps/api/window";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";
import {isTauri} from "@tauri-apps/api/core";
import {createUtoolsWindows} from "@/components/windows";
import type {ToolItemType} from "@/global/PluginList.ts";


export type WindowLabel = "media" | "network";

export interface WindowPayload {
  title: string;
  serverId: string;
  mediaId: string;
  itemId: string;
  item?: NetworkListItem;
}


export async function createWindows(label: WindowLabel, payload: WindowPayload) {
  if (!isTauri()) {
    await createUtoolsWindows(label, payload);
    return ;
  }
  try {
    const windowLabel = `player-${label}`;

    const mainWindow = getCurrentWindow();

    const ww = new WebviewWindow(windowLabel, {
      url: import.meta.env.DEV ? `http://localhost:5123/player-${label}.html` : `./player-${label}.html`,
      title: payload.title,
      width: 1200,
      height: 800,
      resizable: true,
      fullscreen: false,
      transparent: true
    })

    await mainWindow.once("complete", () => {
      ww.emit("init", payload);
    });

    await ww.once('tauri://created', async () => {
      // webview successfully created
      console.log('webview successfully created')
    });
    await ww.once('tauri://error', function (e) {
      // an error happened creating the webview
      console.error('an error happened creating the webview');
      console.error(e);
    });

    if (!ww) return Promise.reject(new Error(`window not found: ${windowLabel}`));

    await ww.show();
    await ww.setFocus();

  } catch (e) {
    console.error(e);
    MessageUtil.error("创建窗口失败", e)
  }
}

export const openPopupSetting = async () => {
  // 创建

  const ww = new WebviewWindow(`plugin-setting`, {
    url: import.meta.env.DEV ? `http://localhost:5123/popup-setting.html` : `./popup-setting.html`,
    title: '设置',
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    resizable: true,
    fullscreen: false
  })


  await ww.once('tauri://created', async () => {
    // webview successfully created
    console.log('webview successfully created')
  });
  await ww.once('tauri://error', function (e) {
    // an error happened creating the webview
    console.error('an error happened creating the webview');
    console.error(e);
  });

  await ww.show();
  await ww.setFocus();

}
export const openPopupAdd = async (type: ToolItemType, panel: string, x: number, y: number) => {
  const ww = new WebviewWindow(`plugin-setting`, {
    url: import.meta.env.DEV ?
      `http://localhost:5123/popup-setting.html?type=${type}&panel=${panel}&x=${x}&y=${y}` :
      `./popup-setting.html?type=${type}&panel=${panel}&x=${x}&y=${y}`,
    title: '设置',
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    resizable: true,
    fullscreen: false
  })


  await ww.once('tauri://created', async () => {
    console.log('webview successfully created')
  });
  await ww.once('tauri://error', function (e) {
    console.error('an error happened creating the webview');
    console.error(e);
  });

  await ww.show();
  await ww.setFocus();

}

export const openPopupEdit = async (id: string, panel: string, x: number, y: number) => {
  const ww = new WebviewWindow(`plugin-setting`, {
    url: import.meta.env.DEV ?
      `http://localhost:5123/popup-setting.html?edit=${id}&panel=${panel}&x=${x}&y=${y}` :
      `./popup-setting.html?edit=${id}&panel=${panel}&x=${x}&y=${y}`,
    title: '编辑',
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    resizable: true,
    fullscreen: false
  })


  await ww.once('tauri://created', async () => {
    console.log('webview successfully created')
  });
  await ww.once('tauri://error', function (e) {
    console.error('an error happened creating the webview');
    console.error(e);
  });

  await ww.show();
  await ww.setFocus();

}

export async function setupWindow() {
  const appWindow = getCurrentWindow();

  // 拦截关闭请求
  await appWindow.onCloseRequested((event) => {
    event.preventDefault(); // 阻止窗口真正关闭
    appWindow.hide();       // 隐藏窗口而非退出
  });

  // 监听插件刷新事件
  // await appWindow.listen('xiaohei://store/plugin/refresh', () => useToolVisibleStore().initTool());
}
