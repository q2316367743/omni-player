import {platform} from "@tauri-apps/plugin-os";
import type {SelectOption} from "tdesign-vue-next";

export type PlayerModeType = "h5" | "mpv" | "potplayer" | "vlc" | "custom";

export function getPlayerModeType(): Array<SelectOption> {
  switch (platform()){
    case "windows":
      return [
        {
          label: "内置播放器",
          value: "h5"
        },
        {
          label: "MPV",
          value: "mpv"
        },
        {
          label: "PotPlayer",
          value: "potplayer"
        },
        {
          label: "VLC",
          value: "vlc"
        }
      ];
    default:
      return [
        {
          label: "内置播放器",
          value: "h5"
        }
      ]
  }
}

export interface GlobalSetting {

  /**
   * 播放模式类型
   * @example mpv
   */
  playerModeType: PlayerModeType;

  /**
   * 播放模式值
   * - potplayer: potplayer.exe 路径
   * - vlc:: vlc.exe 路径
   * - other: 自定义命令，{}替换为播放地址
   */
  playerModeValue: string;

}

export function buildGlobalSetting(): GlobalSetting {
  return {
    playerModeType: "mpv",
    playerModeValue: ""
  }
}