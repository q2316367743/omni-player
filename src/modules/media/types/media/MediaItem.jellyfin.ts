import type {MediaItem} from "@/media/types/media/MediaItem.ts";

/**
 * Jellyfin 特有扩展字段
 * 参考：https://api.jellyfin.org/
 */
export interface MediaItemJellyfin extends MediaItem{

  // Jellyfin 特有
  officialRating?: string;        // 分级（如 "PG-13"）
  communityRating?: number;       // 社区评分（同 rating，但明确来源）
  path?: string;                  // 本地文件路径（仅管理员可见）
  isFolder: boolean;              // 是否为容器
  childCount?: number;            // 子项数量（如剧集的季数）
  providerIds?: {
    Tmdb?: string;
    Imdb?: string;
    Tvdb?: string;
  };
  userData?: {
    played: boolean;
    playCount: number;
    lastPlayedDate?: string;
    playbackPositionTicks: number; // 进度（100ns 单位）
  };

  // 继承 extra 用于其他未列出字段
}