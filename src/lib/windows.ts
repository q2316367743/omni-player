import {WebviewWindow} from "@tauri-apps/api/webviewWindow";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {invoke} from '@tauri-apps/api/core'
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";


export type WindowLabel = "media" | "network" | "file";

export interface WindowPayload {
  title: string;
  serverId: string;
  mediaId: string;
  item?: NetworkListItem
}

export interface CreateTauriWindowOptions {
  label: string;
  url?: string;
  title?: string;
  width?: number;
  height?: number;
  resizable?: boolean;
  fullscreen?: boolean;
  transparent?: boolean;
}

async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function waitForWebviewWindow(label: string) {
  for (let i = 0; i < 20; i++) {
    const win = WebviewWindow.getByLabel(label);
    if (win) return win;
    await sleep(25);
  }
  return null;
}

export async function createWindows(label: WindowLabel, payload: WindowPayload) {
  try {
    const windowLabel = `player-${label}`;
    const options: CreateTauriWindowOptions = {
      label: windowLabel,
      url: import.meta.env.DEV ? `http://localhost:5123/player-${label}.html` : `./player-${label}.html`,
      title: payload.title,
      width: 1200,
      height: 800,
      resizable: true,
      fullscreen: false,
      transparent: true
    };

    const mainWindow = getCurrentWindow();
    let resolveReady!: () => void;
    const ready = new Promise<void>((resolve) => {
      resolveReady = resolve;
    });
    const unlistenComplete = await mainWindow.listen("complete", () => {
      unlistenComplete();
      resolveReady();
    });

    await invoke('create_tauri_window', {options});

    const ww = await waitForWebviewWindow(windowLabel);
    if (!ww) throw new Error(`window not found: ${windowLabel}`);

    await ww.show();
    await ww.setFocus();
    await ready;
    await ww.emit("init", payload);
  } catch (e) {
    console.error(e);
    MessageUtil.error("创建窗口失败", e)
  }
}
