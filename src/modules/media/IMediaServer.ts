// services/MediaServer.ts
import type {MediaItem} from "@/modules/media/types/media/MediaItem.ts";
import type {MediaPerson} from "@/modules/media/types/person/MediaPerson.ts";
import type {MediaPlaybackInfo} from "@/modules/media/types/playback/MediaPlaybackInfo.ts";

export interface IMediaServer {
  // 认证
  authenticate(): Promise<void>; // 返回 token 或 session key

  // 媒体库
  getLibraries(): Promise<MediaItem[]>; // 获取根媒体库（电影、剧集等）

  // 内容浏览
  getItems(parentId?: string, type?: 'Movie' | 'Series'): Promise<MediaItem[]>;
  getItem(id: string): Promise<MediaItem>; // 获取详情（含元数据）

  // 搜索
  search(query: string): Promise<MediaItem[]>;

  // 演员相关
  getPeople(itemId: string): Promise<MediaPerson[]>; // 获取某影片的演员/导演
  getPersonDetails(personId: string): Promise<MediaPerson>;
  getPersonMedia(personId: string): Promise<MediaItem[]>; // 该演员出演的作品

  // 播放
  getPlaybackInfo(itemId: string, options?: {
    maxBitrate?: number;
    audioTrackId?: string;
    subtitleId?: string;
  }): Promise<MediaPlaybackInfo>;

  // 可选：用户信息、播放历史、收藏等
  getUserInfo?(): Promise<any>;
  getWatchedStatus?(itemId: string): Promise<boolean>;
}