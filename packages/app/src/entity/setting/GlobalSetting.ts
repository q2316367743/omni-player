export interface GlobalSetting {

  /**
   * RSS 刷新间隔（单位：分钟）
   */
  rssRefreshInterval: number;

  /**
   * GitHub Token
   */
  githubToken: '';

}

export function buildGlobalSetting(): GlobalSetting {
  return {
    rssRefreshInterval: 15,
    githubToken: ''
  }
}