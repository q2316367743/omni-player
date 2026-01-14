
export interface GlobalSetting {

  /**
   * RSS 刷新间隔（单位：分钟）
   */
  rssRefreshInterval: number;

}

export function buildGlobalSetting(): GlobalSetting {
  return {
    rssRefreshInterval: 15,
  }
}