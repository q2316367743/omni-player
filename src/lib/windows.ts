import {WebviewWindow} from "@tauri-apps/api/webviewWindow";


export type WindowLabel = "media" | "network" | "file";

export interface WindowPayload {
  // 数据ID
  id: string;
  // 播放连接
  url: string;
}

export function createWindows(label: WindowLabel, payload: WindowPayload) {
  const ww = new WebviewWindow(`player-${label}`, {
    url: `./media-${label}.html`,
    title: "媒体播放器",
    width: 1200,
    height: 800,
    resizable: true,
    transparent: true
  });
  ww.listen("complete", () => {
    // 发送初始化信息
    ww.emit("init", payload);
  })
}