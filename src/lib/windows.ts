import {WebviewWindow} from "@tauri-apps/api/webviewWindow";
import {getCurrentWindow} from "@tauri-apps/api/window";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";


export type WindowLabel = "media" | "network" | "file";

export interface WindowPayload {
  title: string;
  serverId: string;
  mediaId: string;
  itemId: string;
  item?: NetworkListItem;
}


export async function createWindows(label: WindowLabel, payload: WindowPayload) {
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
