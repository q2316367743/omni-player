export type PlayerModeType = "h5" | "mpv" | "potplayer" | "vlc" | "other";

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