/**
 * 融合媒体项（Fused Media Item）
 *
 * 用于本地缓存的轻量级元数据，不包含视频流、字幕等大体积资源。
 * 所有图片/视频 URL 均指向原始媒体服务器（直连，不下载）。
 *
 * ID 规则：`${serverId}::${originalItemId}`
 * 示例：`jellyfin-home::a1b2c3d4`
 */
export interface FusedMediaItem {
  /**
   * 全局唯一 ID，由 [站点ID] + [原始项ID] 拼接而成
   * 格式：`${serverId}::${originalItemId}`
   * 用作数据库主键和前端 key
   */
  id: string;

  /**
   * 来源站点的唯一标识符（由用户添加站点时生成）
   * 示例：'jellyfin-nas', 'plex-office', 'feiniu-local'
   */
  serverId: string;

  /**
   * 原始媒体服务器中的项目 ID
   * - Jellyfin/Emby: 字符串型 GUID（如 "abcdef123456"）
   * - Plex: 数字字符串（如 "12345"）
   * - 飞牛/极影视：通常为数字或字符串
   */
  originalItemId: string;

  /**
   * 媒体类型（标准化）
   * - 'Movie': 电影
   * - 'Series': 剧集（根）
   * - 'Season': 季
   * - 'Episode': 单集
   * - 'Person': 演员/导演等人物
   * - 'Collection': 合集（如“漫威系列”）
   * - 'Folder': 通用文件夹（兜底）
   */
  type: 'Movie' | 'Series' | 'Season' | 'Episode' | 'Person' | 'Collection' | 'Folder';

  /**
   * 主标题（必填）
   * - 电影：片名
   * - 剧集：剧名
   * - 单集：集标题（如 "S01E03 - 红色警戒"）
   * - 人物：姓名
   */
  name: string;

  /**
   * 原始标题（可选，用于排序或搜索）
   * 如英文原名、日文原名等
   */
  originalTitle?: string;

  /**
   * 上映/发布年份
   * 用于海报墙展示和排序
   */
  year?: number;

  /**
   * 主海报图 URL（直连源站）
   * 示例：
   * - Jellyfin: http://nas:8096/Items/{id}/Images/Primary
   * - Plex: http://plex:32400/library/metadata/{id}/thumb
   * 前端直接 <img :src="posterUrl" />
   */
  posterUrl?: string;

  /**
   * 背景图/横幅图 URL（用于详情页背景）
   */
  backdropUrl?: string;

  /**
   * 简介/剧情概述
   * 可能包含 HTML 标签（如 Plex），前端需 sanitize
   */
  overview?: string;

  /**
   * 评分（0.0 ~ 10.0）
   * - Jellyfin/Emby: CommunityRating
   * - Plex: rating
   */
  rating?: number;

  /**
   * 时长（秒）
   * 仅适用于 Movie / Episode
   */
  runtimeSeconds?: number;

  /**
   * 分类标签（如 ["动作", "科幻", "2020s"]）
   * 用于筛选和推荐
   */
  genres?: string[];

  /**
   * 创建时间（ISO 8601）
   * 用于首次同步和排序
   * 示例: "2024-05-20T14:30:00Z"
   */
  dateCreated: string;

  /**
   * 最后修改时间（ISO 8601）
   * 用于增量同步判断是否需要更新
   * 若服务器不支持，可等于 dateCreated
   */
  dateModified: string;

  /**
   * 父级 ID（用于构建树形结构）
   * - Episode 的 parentId = Season ID
   * - Season 的 parentId = Series ID
   * - Movie/Person 通常为空
   */
  parentId?: string;

  /**
   * 额外元数据（用于平台特有字段兜底）
   * 示例：
   * - { plexKey: "/library/metadata/12345" }
   * - { embyTaglines: ["One hero falls..."] }
   * 不参与核心逻辑，但可用于高级功能
   */
  extra?: Record<string, unknown>;
}

/**
 * 辅助工具类型：根据 type 筛选子集
 */
export type FusedMovie = FusedMediaItem & { type: 'Movie' };
export type FusedSeries = FusedMediaItem & { type: 'Series' };
export type FusedEpisode = FusedMediaItem & { type: 'Episode'; parentId: string; runtimeSeconds: number };
export type FusedPerson = FusedMediaItem & { type: 'Person' };