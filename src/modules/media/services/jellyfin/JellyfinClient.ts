// src/services/jellyfin/JellyfinClient.ts

import type {IMediaServer} from '@/media/IMediaServer.ts';
import type {MediaItemJellyfin} from '@/media/types/media/MediaItem.jellyfin';
import type {MediaPersonJellyfin} from '@/media/types/person/MediaPerson.jellyfin';
import type {MediaPlaybackInfoJellyfin} from '@/media/types/playback//MediaPlaybackInfo.jellyfin';
import {normalizeMediaItem, normalizePerson} from './utils';
import type {MediaServer} from "@/entity/MediaServer.ts";
import {useStronghold} from "@/lib/Stronghold.ts";
import type {MediaItem} from "@/media/types/media/MediaItem";
import type {MediaPerson} from "@/media/types/person/MediaPerson";
import {postAction, requestAction, type RequestConfig, type Method} from "@/lib/http.ts";

export class JellyfinClient implements IMediaServer {
  private readonly server: MediaServer;
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private userId: string | null = null;

  constructor(server: MediaServer) {
    this.server = server;
    this.baseUrl = server.url;
  }

  /**
   * 认证用户
   */
  async authenticate(): Promise<void> {
    const username = useStronghold().getMediaRecord(this.server.id, 'username');
    const password = useStronghold().getMediaRecord(this.server.id, 'password');
    const {data: res} = await postAction(`${this.baseUrl}/Users/AuthenticateByName`, {
      Username: username,
      Pw: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `MediaBrowser Client="TauriApp", Device="Desktop", DeviceId="tauri-${Date.now()}", Version="1.0"`,
      },
    });

    if (!res.ok) throw new Error('Authentication failed');

    const data = await res.json();
    this.accessToken = data.AccessToken;
    this.userId = data.User.Id;
  }


  private getAuthHeaders() {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    return {
      'X-MediaBrowser-Token': this.accessToken,
    };
  }

  private async request<T extends Record<string, any>>(url: string, method: Method, config?: RequestConfig) {
    const {data} = await requestAction<T>(
      {
        ...config,
        method,
        url,
        baseURL: this.baseUrl,
        headers: {
          ...config?.headers,
          ...this.getAuthHeaders(),
        },
        responseType: "json"
      },
    )
    return data;
  }

  private async getAction<T extends Record<string, any>>(url: string, params?: Record<string, any>, config?: RequestConfig) {
    return this.request<T>(
      url, "GET",
      {
        ...config,
        params,
      },
    )
  }


  private async postAction<T extends Record<string, any>>(url: string, data?: Record<string, any>, config?: RequestConfig) {
    return this.request<T>(
      url, "POST",
      {
        ...config,
        data: data,
      },
    )
  }


  /**
   * 获取根媒体库（电影、剧集等）
   */
  async getLibraries(): Promise<MediaItemJellyfin[]> {
    const data = await this.getAction(
      `/Users/${this.userId}/Views`,
    );
    return data.Items.map((item: any) =>
      normalizeMediaItem({...item, ServerUrl: this.baseUrl})
    );
  }

  /**
   * 获取子项（支持 parentId 和 type 过滤）
   */
  async getItems(parentId?: string, type?: 'Movie' | 'Series'): Promise<MediaItemJellyfin[]> {
    let url = `/Users/${this.userId}/Items?`;
    const params: Record<string, string> = {};

    if (parentId) params['ParentId'] = parentId;
    if (type) {
      params['IncludeItemTypes'] = type === 'Movie' ? 'Movie' : 'Series';
    }
    params['Recursive'] = 'true';
    params['Fields'] = 'ProviderIds,UserData,Genres,Overview,DateCreated,DateLastSaved';
    params['ImageTypeLimit'] = '1';
    params['EnableImageTypes'] = 'Primary,Backdrop';

    const data = await this.getAction(url, params);
    return data.Items.map((item: any) =>
      normalizeMediaItem({...item, ServerUrl: this.baseUrl})
    );
  }

  /**
   * 获取单个媒体详情
   */
  async getItem(id: string): Promise<MediaItemJellyfin> {
    const item = await this.getAction(
      `/Users/${this.userId}/Items/${id}?Fields=ProviderIds,UserData,Genres,Overview,DateCreated,DateLastSaved,People`,
    );
    return normalizeMediaItem({...item, ServerUrl: this.baseUrl});
  }

  /**
   * 获取演职员列表（从媒体详情中提取）
   */
  async getPeople(itemId: string): Promise<MediaPersonJellyfin[]> {
    const item = await this.getItem(itemId);
    // Jellyfin 在 getItem 时已包含 People 字段（若请求了 Fields=People）
    const people = (item.extra?.People as any[]) || [];
    return people.map(p => normalizePerson(p, this.baseUrl));
  }

  /**
   * 搜索（简单实现：使用通用搜索 API）
   */
  async search(query: string): Promise<MediaItemJellyfin[]> {
    const data = await this.getAction(
      `/Search/Hints?SearchTerm=${encodeURIComponent(query)}&IncludeItemTypes=Movie,Series,Person`
    );
    return data.SearchHints.map((hint: any) =>
      normalizeMediaItem({
        ...hint,
        Id: hint.ItemId,
        Name: hint.Name,
        Type: hint.Type,
        ServerUrl: this.baseUrl,
      })
    );
  }

  /**
   * 获取播放流信息（直连或转码）
   */
  async getPlaybackInfo(
    itemId: string,
    options: { maxBitrate?: number; audioTrackId?: string; subtitleId?: string } = {}
  ): Promise<MediaPlaybackInfoJellyfin> {
    // 简化：直接使用 Direct Stream（假设客户端支持硬解）
    const streamUrl = `${this.baseUrl}/Videos/${itemId}/stream?static=true&mediaSourceId=${itemId}`;

    // 获取媒体源以提取容器和音轨
    const playbackData = await this.postAction(
      `${this.baseUrl}/Items/${itemId}/PlaybackInfo`,
      {
        UserId: this.userId,
        MaxStreamingBitrate: options.maxBitrate || 100_000_000, // 100 Mbps
        AutoOpenLiveStream: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const mediaSource = playbackData.MediaSources?.[0];

    const container = mediaSource?.Container || 'mp4';

    // 构建字幕 URL（仅外挂字幕）
    const subtitleUrls: string[] = [];
    if (mediaSource?.MediaStreams) {
      for (const stream of mediaSource.MediaStreams) {
        if (stream.Type === 'Subtitle' && stream.DeliveryUrl) {
          subtitleUrls.push(this.baseUrl + stream.DeliveryUrl);
        }
      }
    }

    // 音轨
    const audioTracks = (mediaSource?.MediaStreams || [])
      .filter((s: any) => s.Type === 'Audio')
      .map((s: any) => ({
        id: s.Index.toString(),
        title: s.DisplayTitle || s.Language || 'Audio Track',
        language: s.Language,
        isDefault: s.IsDefault,
      }));

    return {
      streamUrl,
      subtitleUrls,
      audioTracks,
      container,
      isDirectPlay: true, // 简化：假设直通
      mediaSourceId: mediaSource?.Id || itemId,
      deviceId: 'tauri-desktop',
      accessToken: this.accessToken || '',
      playSessionId: `session-${Date.now()}`,
    };
  }

  getPersonDetails(personId: string): Promise<MediaPerson> {
    throw new Error("Method not implemented.");
  }

  getPersonMedia(personId: string): Promise<MediaItem[]> {
    throw new Error("Method not implemented.");
  }

  getUserInfo?(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getWatchedStatus?(itemId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

}