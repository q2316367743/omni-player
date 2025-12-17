import { invoke } from '@tauri-apps/api/core'
import type {WindowLabel, WindowPayload} from "@/lib/windows.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useGlobalSettingStore} from "@/store/GlobalSettingStore.ts";

function openPotPlayerForMedia(payload: WindowPayload) {
  const {playerModeValue} = useGlobalSettingStore().globalSetting;
  if (!playerModeValue) {
    MessageUtil.error("请先设置PotPlayer地址");
    return;
  }

  invoke('launch_potplayer', {
    exe_path: playerModeValue,
    url: 'https://example.com/video.m3u8',
  })
}

export function openPotPlayer(label: WindowLabel, payload: WindowPayload) {
  switch (label) {
    case "media":
      openPotPlayerForMedia(payload);
      break;
    default:
      MessageUtil.error(`不支持的窗口类型: ${label}`);
  }
}