import type {IMediaServer} from '@/modules/media/IMediaServer.ts';
import type {MediaItemJellyfin} from '@/modules/media/types/media/MediaItem.jellyfin';
import type {MediaPersonJellyfin} from '@/modules/media/types/person/MediaPerson.jellyfin';
import type {MediaPlaybackInfoJellyfin} from '@/modules/media/types/playback/MediaPlaybackInfo.jellyfin';
import {
  buildBackdropUrls,
  mapItemType,
  mapMediaSource,
  mapPersonType,
  normalizeImageUrl,
  normalizeMediaItem,
  normalizePerson
} from './utils';
import type {MediaServer} from "@/entity/MediaServer.ts";
import {useMediaStronghold} from "@/lib/Stronghold.ts";
import type {MediaItem} from "@/modules/media/types/media/MediaItem";
import {type Method, postAction, requestAction, type RequestConfig} from "@/lib/http.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import type {PaginatedResult, PaginationOptions} from "@/modules/media/types/common/MediaPage.ts";
import type {MediaDetailJellyfin} from "@/modules/media/types/detail/MediaDetail.jellyfin.ts";
import type { MediaPlaybackReport } from "@/modules/media/types/playback/MediaPlaybackReport";
import type {
  MediaEpisodeItemJellyfin,
  MediaEpisodeJellyfin
} from "@/modules/media/types/detail/MediaEpisode.jellyfin.ts";
import type {MediaSeasonItemJellyfin, MediaSeasonJellyfin} from "@/modules/media/types/detail/MediaSeason.jellyfin.ts";


export class JellyfinClient implements IMediaServer {
  private readonly server: MediaServer;
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private userId: string | null = null;
  private authenticating: Promise<void> | null = null;

  constructor(server: MediaServer) {
    this.server = server;
    this.baseUrl = server.url;
  }


  /**
   * 认证用户
   */
  async authenticate(): Promise<void> {
    const stronghold = useMediaStronghold();
    const accessToken = await stronghold.getMediaRecord(this.server.id, "accessToken");
    if (accessToken) {
      this.accessToken = accessToken;
      try {
        const {data, status} = await requestAction<any>({
          url: "/Users/Me",
          method: "GET",
          baseURL: this.baseUrl,
          headers: this.getAuthHeaders(),
          responseType: "json"
        });
        if (status === 200 && data) {
          this.userId = data.Id;
          console.log("JellyfinClient 跳过登录")
          return;
        }
      } catch {
      }
      await stronghold.removeMediaRecord(this.server.id, "accessToken");
      this.accessToken = null;
    }
    const username = await stronghold.getMediaRecord(this.server.id, "username");
    const password = await stronghold.getMediaRecord(this.server.id, "password");
    if (!username || !password) {
      await MessageBoxUtil.alert("未配置 Jellyfin 用户名或密码", "登录失败");
      throw new Error("Jellyfin username or password is missing");
    }
    try {
      const {data, status} = await postAction<any>(`${this.baseUrl}/Users/AuthenticateByName`, {
        Username: username,
        Pw: password
      }, {
        headers: {
          "Content-Type": "application/json",
          "X-Emby-Authorization": `MediaBrowser Client="TauriApp", Device="Desktop", DeviceId="tauri-${Date.now()}", Version="1.0"`
        }
      });
      if (status !== 200 || !data) {
        const message = (data && (data as any).ErrorMessage) || "登录失败";
        await MessageBoxUtil.alert(message, "登录失败");
        return Promise.reject(new Error(message))
      }
      this.accessToken = data.AccessToken;
      await stronghold.setMediaRecord(this.server.id, "accessToken", this.accessToken!, 30 * 24 * 60 * 60 * 1000);
      this.userId = data.User.Id;
    } catch (e: any) {
      let message = "登录失败";
      const responseData = e?.response?.data;
      if (responseData) {
        if (typeof responseData === "string") {
          message = responseData;
        } else if (typeof responseData === "object") {
          message = responseData.ErrorMessage || responseData.Message || message;
        }
      } else if (e?.message) {
        message = e.message;
      }
      await MessageBoxUtil.alert(message, "登录失败");
      return Promise.reject(e);
    }
  }

  private getAuthHeaders() {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    return {
      'X-MediaBrowser-Token': this.accessToken,
    };
  }

  private async ensureAuthenticated(options?: { force?: boolean }) {
    if (!options?.force && this.accessToken && this.userId) return;
    if (this.authenticating) return this.authenticating;
    this.authenticating = this.authenticate().finally(() => {
      this.authenticating = null;
    });
    return this.authenticating;
  }

  private async invalidateAuthentication() {
    this.accessToken = null;
    this.userId = null;
    try {
      await useMediaStronghold().removeMediaRecord(this.server.id, "accessToken");
    } catch {
    }
  }

  private parseStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;
    const maybeError = error as { response?: unknown; status?: unknown };
    if (typeof maybeError.status === "number") return maybeError.status;
    const response = maybeError.response;
    if (!response || typeof response !== "object") return undefined;
    const maybeResponse = response as { status?: unknown };
    return typeof maybeResponse.status === "number" ? maybeResponse.status : undefined;
  }

  private async request<T extends Record<string, any>>(url: string, method: Method, config?: RequestConfig) {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.ensureAuthenticated();

        const requestConfig: RequestConfig = {
          ...config,
          method,
          url,
          baseURL: this.baseUrl,
          headers: {
            ...config?.headers,
            ...this.getAuthHeaders(),
          },
          responseType: "json"
        };

        const {data} = await requestAction<T>(requestConfig);
        return data;
      } catch (e) {
        const status = this.parseStatus(e);
        const shouldRetry = attempt < maxAttempts && (status === 401 || status === 403 || (e instanceof Error && e.message === "Not authenticated"));
        if (!shouldRetry) throw e;

        await this.invalidateAuthentication();
        await this.ensureAuthenticated({force: true});
      }
    }

    throw new Error("Request failed after retries");
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
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }
    const data = await this.getAction(
      `/Users/${userId}/Views`,
    );
    return data.Items.map((item: any) =>
      normalizeMediaItem({...item, ServerUrl: this.baseUrl})
    );
  }

  /**
   * 获取子项（支持 parentId 和 type 过滤）
   */
  async getItems(options: PaginationOptions, parentId?: string): Promise<PaginatedResult<MediaItem>> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }
    const {
      page = 1,
      pageSize = 50,
      sortBy = 'SortName',       // Jellyfin 默认按名称排序
      sortOrder = 'Ascending',
      isUnplayed,
      isFavorite,
      genres,
      years,
      type
    } = options || {};
    const params: Record<string, string> = {
      Recursive: 'true',
      Fields: 'ProviderIds,UserData,Genres,Overview,DateCreated,DateLastSaved,ChildCount,RecursiveItemCount',
      ImageTypeLimit: '1',
      EnableImageTypes: 'Primary,Backdrop',
      // 👇 关键：排序
      SortBy: sortBy,
      SortOrder: sortOrder,
      IncludeItemTypes: "Movie,Series"
    };

    if (type) {
      params['IncludeItemTypes'] = type;
    }

    // 高级过滤（可选）
    if (isUnplayed) params['IsUnplayed'] = 'true';
    if (isFavorite) params['IsFavorite'] = 'true';
    if (genres?.length) {
      genres.forEach(g => params['Genres'] = g);
    }
    if (years?.length) {
      // Jellyfin 支持 Year 参数（单值或范围需多次请求，此处简化为单年）
      years.forEach(y => params['Years'] = y.toString());
    }


    if (parentId) params['ParentId'] = parentId;

    const startIndex = (page - 1) * pageSize;
    // 👇 关键：分页参数
    params['StartIndex'] = startIndex.toString();
    params['Limit'] = pageSize.toString();

    const data = await this.getAction(`/Users/${userId}/Items`, params);
    const items = data.Items.map((item: any) =>
      normalizeMediaItem({...item, ServerUrl: this.baseUrl})
    );

    return {
      items,
      total: data.TotalRecordCount,
      hasNext: startIndex + pageSize < data.TotalRecordCount,
    };
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
   * 获取单个媒体详情
   */
  async getItem(id: string): Promise<MediaDetailJellyfin> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // 请求完整字段（Jellyfin 官方推荐）
    const fields = [
      'Genres', 'Overview', 'Ratings', 'People', 'Chapters',
      'MediaSources', 'ProviderIds', 'DateCreated', 'DateLastSaved',
      'Studios', 'ProductionLocations', 'Taglines', 'UserData',
      'Tags', 'Keywords', 'ProductionYear', 'PremiereDate',
      'EndDate', 'Status', 'SeriesStudio', 'SeriesStatus',
      'SeasonUserData', 'SeriesUserData', 'RecursiveItemCount',
      'ChildCount', 'CumulativeRunTimeTicks', 'Metascore',
      'Awards', 'Video3DFormat', 'AspectRatio', 'VideoRange',
      'DisplayOrder', 'SortName', 'OfficialRatingDescription',
      'CustomRating', 'OriginalTitle', 'PrimaryImageAspectRatio',
      'ProductionLocations', 'Path', 'FileName', 'IsHD',
      'IsShortcut', 'Width', 'Height', 'ExtraIds',
      'ExtraType', 'TrickplayToken', 'CollectionType',
      'Album', 'AlbumId', 'AlbumArtist', 'ArtistItems',
      'SeriesPresentationUniqueKey', 'PresentationUniqueKey'
    ].join(',');

    const enableImageTypes = 'Primary,Backdrop,Logo,Art,Banner,Thumb,Disc,Menu,Screenshot,Chapter,Box,BoxRear,Profile';

    const rawItem = await this.getAction<any>(
      `/Users/${userId}/Items/${id}`,
      {
        Fields: fields,
        EnableImageTypes: enableImageTypes,
        ImageTypeLimit: 0,
      }
    );

    // === 开始映射到通用 MediaDetail ===

    // --- 基础信息 ---
    return {
      id: rawItem.Id,
      name: rawItem.Name || '',
      type: mapItemType(rawItem.Type),
      year: rawItem.ProductionYear,
      posterUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Primary', rawItem.ImageTags?.Primary),
      backdropUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Backdrop', rawItem.ImageTags?.Backdrop),
      overview: rawItem.Overview,
      rating: rawItem.CommunityRating,
      genres: rawItem.GenreItems?.map((g: any) => g.Name) || [],
      dateCreated: rawItem.DateCreated,
      parentId: rawItem.ParentId,

      // --- 新增基础信息 ---
      premiereDate: rawItem.PremiereDate,
      endDate: rawItem.EndDate,
      sortName: rawItem.SortName || rawItem.Name,
      officialRating: rawItem.OfficialRating,
      customRating: rawItem.CustomRating,
      communityRating: rawItem.CommunityRating,
      criticRating: rawItem.CriticRating,
      metascore: rawItem.Metascore,
      awards: rawItem.Awards || [],
      tags: rawItem.Tags || [],
      productionYear: rawItem.ProductionYear,
      status: rawItem.Status,
      video3DFormat: rawItem.Video3DFormat,
      aspectRatio: rawItem.AspectRatio,
      videoRange: rawItem.VideoRange,
      width: rawItem.Width,
      height: rawItem.Height,
      size: rawItem.Size,
      container: rawItem.Container,
      isHD: rawItem.IsHD,
      path: rawItem.Path,
      fileName: rawItem.FileName,

      // --- 增强字段 ---
      originalTitle: rawItem.OriginalTitle,
      tagline: rawItem.Taglines?.[0],
      studios: rawItem.Studios?.map((s: any) => s.Name).filter(Boolean) || [],
      productionLocations: rawItem.ProductionLocations || [],

      // --- 新增元数据字段 ---
      keywords: rawItem.Keywords || [], // 关键词
      seriesStudio: rawItem.SeriesStudio, // 系列制片公司
      seriesStatus: rawItem.SeriesStatus, // 系列状态
      displayOrder: rawItem.DisplayOrder, // 显示顺序
      officialRatingDescription: rawItem.OfficialRatingDescription, // 分级描述
      primaryImageAspectRatio: rawItem.PrimaryImageAspectRatio, // 主图宽高比
      isShortcut: rawItem.IsShortcut, // 是否快捷方式
      extraIds: rawItem.ExtraIds || [], // 额外ID
      extraType: rawItem.ExtraType, // 额外类型
      trickplayToken: rawItem.TrickplayToken, // 特技播放令牌
      collectionType: rawItem.CollectionType, // 收藏类型
      album: rawItem.Album, // 专辑
      albumId: rawItem.AlbumId, // 专辑ID
      albumArtist: rawItem.AlbumArtist, // 专辑艺术家
      artistItems: rawItem.ArtistItems?.map((a: any) => ({
        id: a.Id,
        name: a.Name,
        imageUrl: a.PrimaryImageTag ? normalizeImageUrl(this.baseUrl, a.Id, 'Primary', a.PrimaryImageTag) : undefined,
      })) || [], // 艺术家项目
      seriesPresentationUniqueKey: rawItem.SeriesPresentationUniqueKey, // 系列展示唯一键
      presentationUniqueKey: rawItem.PresentationUniqueKey, // 展示唯一键

      // --- 多图支持 ---
      backdropUrls: buildBackdropUrls(this.baseUrl, rawItem.Id, rawItem.BackdropImageTags),
      logoUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Logo', rawItem.ImageTags?.Logo),
      thumbUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Thumb', rawItem.ImageTags?.Thumb),
      artUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Art', rawItem.ImageTags?.Art),

      // --- 新增图片类型 ---
      discUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Disc', rawItem.ImageTags?.Disc),
      menuUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Menu', rawItem.ImageTags?.Menu),
      screenshotUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Screenshot', rawItem.ImageTags?.Screenshot),
      chapterImageUrls: (rawItem.ChapterImages || []).map((tag: string, index: number) =>
        `${this.baseUrl}/Videos/${rawItem.Id}/Chapters/${index}/Images/Chapter?tag=${tag}`
      ),
      boxUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Box', rawItem.ImageTags?.Box),
      boxRearUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'BoxRear', rawItem.ImageTags?.BoxRear),
      profileUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, 'Profile', rawItem.ImageTags?.Profile),

      // --- 播放相关 ---
      runtimeSeconds: rawItem.RunTimeTicks ? Math.floor(rawItem.RunTimeTicks / 10_000_000) : undefined,
      chapters: (rawItem.Chapters || []).map((ch: any) => ({
        startSeconds: Math.floor(ch.StartPositionTicks / 10_000_000),
        title: ch.Name || `Chapter ${ch.IndexNumber || ''}`,
        thumbnailUrl: ch.ImageTag
          ? `${this.baseUrl}/Videos/${rawItem.Id}/Chapters/${ch.IndexNumber}/Images/Thumbnail?tag=${ch.ImageTag}`
          : undefined,
      })),

      // --- 演职员 ---
      people: (rawItem.People || []).map((p: any) => ({
        id: p.Id || `person-${p.Name}`,
        name: p.Name || '',
        role: p.Role || p.Character || '', // Jellyfin 角色名或角色名
        type: mapPersonType(p.Type || p.PersonType),
        imageUrl: p.PrimaryImageTag
          ? normalizeImageUrl(this.baseUrl, p.Id, 'Primary', p.PrimaryImageTag)
          : undefined,
        // 添加更多演员信息
        job: p.Job || '', // 技术职位（导演、编剧等）
        department: p.Department || '', // 部门
        sortOrder: p.SortOrder || 0, // 排序顺序
        birthDate: p.BirthDate || '', // 出生日期
        deathDate: p.DeathDate || '', // 去世日期
        birthplace: p.BirthPlace || '', // 出生地
        imdbId: p.ProviderIds?.Imdb || '', // IMDb ID
        tmdbId: p.ProviderIds?.Tmdb || '', // TMDb ID
      })),

      // --- 外部 ID ---
      externalIds: {
        tmdb: rawItem.ProviderIds?.Tmdb,
        imdb: rawItem.ProviderIds?.Imdb,
        tvdb: rawItem.ProviderIds?.Tvdb,
      },

      // --- 用户状态 ---
      userState: rawItem.UserData ? {
        played: !!rawItem.UserData.Played,
        playCount: rawItem.UserData.PlayCount || 0,
        lastPlayedAt: rawItem.UserData.LastPlayedDate,
        playbackPositionSeconds: rawItem.UserData.PlaybackPositionTicks
          ? Math.floor(rawItem.UserData.PlaybackPositionTicks / 10_000_000)
          : undefined,
        isFavorite: !!rawItem.UserData.IsFavorite,
        personalRating: rawItem.UserData.UserRating,
      } : undefined,

      // --- 关联信息 ---
      seriesName: rawItem.SeriesName,
      seasonName: rawItem.SeasonName,
      indexNumber: rawItem.IndexNumber,
      parentIndexNumber: rawItem.ParentIndexNumber,

      // --- 新增系列统计信息 ---
      recursiveItemCount: rawItem.RecursiveItemCount, // 递归项目计数
      childCount: rawItem.ChildCount, // 子项目计数
      cumulativeRunTimeTicks: rawItem.CumulativeRunTimeTicks, // 累计运行时间
      seasonUserData: rawItem.SeasonUserData, // 季用户数据
      seriesUserData: rawItem.SeriesUserData, // 系列用户数据

      // --- 播放源（关键！用于音轨/字幕切换）---
      mediaSources: (rawItem.MediaSources || []).map((source: any) => mapMediaSource(this.baseUrl, source)),

      // --- 兜底 ---
      extra: rawItem,
    };
  }

  async getItemSeason(id: string): Promise<MediaSeasonJellyfin> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const data = await this.getAction<any>(
      `/Shows/${id}/Seasons`,
      {
        UserId: userId,
        EnableImageTypes: 'Primary,Backdrop',
        Fields: 'UserData,ImageTags,ImageBlurHashes',
      }
    );

    const rawItems = Array.isArray(data) ? data : (data?.Items || []);
    const items = (rawItems as any[]).map((raw) => {
      const imageTags = (raw?.ImageTags ?? {}) as Record<string, string>;
      const userDataRaw = raw?.UserData ?? {};

      return {
        id: raw?.Id,
        name: raw?.Name ?? '',
        indexNumber: raw?.IndexNumber,
        seriesId: raw?.SeriesId ?? id,
        seriesName: raw?.SeriesName ?? '',
        isFolder: !!raw?.IsFolder,
        type: 'Season',
        primaryImageTag: imageTags.Primary,
        backdropImageTag: imageTags.Backdrop,
        userData: {
          unplayedItemCount: userDataRaw?.UnplayedItemCount,
          played: userDataRaw?.Played,
          isFavorite: userDataRaw?.IsFavorite,
          playCount: userDataRaw?.PlayCount,
          playbackPositionTicks: userDataRaw?.PlaybackPositionTicks ?? 0,
          key: userDataRaw?.Key ?? '',
        },
        serverId: raw?.ServerId ?? this.server.id,
        canDelete: !!raw?.CanDelete,
        channelId: raw?.ChannelId,
        imageTags: imageTags,
        imageBlurHashes: raw?.ImageBlurHashes ?? {},
        locationType: raw?.LocationType ?? '',
        mediaType: raw?.MediaType ?? '',
      } as MediaSeasonItemJellyfin;
    });

    return {
      items,
      totalRecordCount: data?.TotalRecordCount,
      startIndex: data?.StartIndex,
    };
  }
  async getItemEpisode(id: string, seasonId: string): Promise<MediaEpisodeJellyfin> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const data = await this.getAction<any>(
      `/Shows/${id}/Episodes`,
      {
        UserId: userId,
        SeasonId: seasonId,
        EnableImageTypes: 'Primary,Backdrop',
        Fields: 'UserData,ImageTags,ImageBlurHashes,PrimaryImageAspectRatio,MediaSources',
        SortBy: 'IndexNumber',
        SortOrder: 'Ascending',
      }
    );

    const rawItems = Array.isArray(data) ? data : (data?.Items || []);
    const items = (rawItems as any[]).map((raw) => {
      const imageTagsRaw = (raw?.ImageTags ?? {}) as Record<string, string>;
      const userDataRaw = raw?.UserData ?? {};
      const positionTicks = userDataRaw?.PlaybackPositionTicks;

      const runtimeMs = typeof raw?.RunTimeTicks === 'number'
        ? Math.floor(raw.RunTimeTicks / 10_000)
        : undefined;

      return {
        id: raw?.Id,
        name: raw?.Name ?? '',
        seasonId: raw?.SeasonId ?? raw?.ParentId ?? seasonId,
        seasonName: raw?.SeasonName ?? '',
        seriesId: raw?.SeriesId ?? id,
        seriesName: raw?.SeriesName ?? '',
        indexNumber: raw?.IndexNumber,
        parentIndexNumber: raw?.ParentIndexNumber,
        runtimeMs,
        isFolder: !!raw?.IsFolder,
        type: 'Episode',
        primaryImageTag: imageTagsRaw.Primary,
        backdropImageTag: imageTagsRaw.Backdrop,
        userData: {
          playbackPositionMs: typeof positionTicks === 'number' ? Math.floor(positionTicks / 10_000) : undefined,
          playCount: userDataRaw?.PlayCount,
          played: userDataRaw?.Played,
          isFavorite: userDataRaw?.IsFavorite,
          lastPlayedDate: userDataRaw?.LastPlayedDate,
          key: userDataRaw?.Key ?? '',
        },
        container: raw?.Container,
        hasSubtitles: raw?.HasSubtitles,
        serverId: raw?.ServerId ?? this.server.id,
        canDelete: !!raw?.CanDelete,
        channelId: raw?.ChannelId,
        videoType: raw?.VideoType ?? '',
        imageTags: {
          primary: imageTagsRaw.Primary,
        },
        imageBlurHashes: {
          primary: raw?.ImageBlurHashes?.Primary ?? raw?.ImageBlurHashes?.primary,
        },
        locationType: raw?.LocationType ?? '',
        mediaType: raw?.MediaType ?? '',
        primaryImageAspectRatio: raw?.PrimaryImageAspectRatio,
      } as MediaEpisodeItemJellyfin;
    });

    return {
      items,
      totalRecordCount: data?.TotalRecordCount,
      startIndex: data?.StartIndex,
    };
  }

  /**
   * 获取演职员列表（从媒体详情中提取）
   */
  async getPeople(itemId: string): Promise<MediaPersonJellyfin[]> {
    const res = await this.getAction<any>(`/Items/${itemId}/People`);
    const peopleRaw = Array.isArray(res) ? res : (res?.People || res?.Items || []);
    return (peopleRaw as any[]).map((p) => normalizePerson(p, this.baseUrl));
  }

  async getPersonDetails(personId: string): Promise<MediaPersonJellyfin> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const person = await this.getAction<any>(
      `/Users/${userId}/Items/${personId}`,
      {
        Fields: "Overview",
      }
    );

    const birthYear = typeof person?.BirthYear === "number"
      ? person.BirthYear
      : (typeof person?.BirthDate === "string" ? new Date(person.BirthDate).getFullYear() : undefined);

    const deathYear = typeof person?.EndYear === "number"
      ? person.EndYear
      : (typeof person?.DeathDate === "string" ? new Date(person.DeathDate).getFullYear() : undefined);

    const primaryImageTag = person?.PrimaryImageTag ?? person?.ImageTags?.Primary;

    return {
      id: person.Id,
      name: person.Name,
      type: 'Actor',
      imageUrl: primaryImageTag ? `${this.baseUrl}/Items/${person.Id}/Images/Primary?tag=${primaryImageTag}` : undefined,
      birthYear,
      deathYear,
      biography: person.Overview,
      extra: person,
    };
  }

  async getPersonMedia(personId: string): Promise<MediaItem[]> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const pageSize = 200;
    let startIndex = 0;
    const items: MediaItem[] = [];

    while (true) {
      const data = await this.getAction<any>(
        `/Users/${userId}/Items`,
        {
          Recursive: "true",
          PersonIds: personId,
          IncludeItemTypes: "Movie,Series",
          Fields: "ProviderIds,UserData,Genres,Overview,DateCreated,DateLastSaved",
          SortBy: "SortName",
          SortOrder: "Ascending",
          StartIndex: startIndex.toString(),
          Limit: pageSize.toString(),
        }
      );

      const batch = (data?.Items || []) as any[];
      for (const raw of batch) {
        items.push(normalizeMediaItem({...raw, ServerUrl: this.baseUrl}));
      }

      const total = typeof data?.TotalRecordCount === "number" ? data.TotalRecordCount : items.length;
      startIndex += batch.length;
      if (batch.length === 0 || startIndex >= total) break;
    }

    return items;
  }

  /**
   * 获取播放流信息（直连或转码）
   */
  async getPlaybackInfo(
    itemId: string,
    options: { maxBitrate?: number; audioTrackId?: string; subtitleId?: string } = {}
  ): Promise<MediaPlaybackInfoJellyfin> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }
    // 获取媒体源以提取容器和音轨
    const playbackData = await this.postAction(
      `/Items/${itemId}/PlaybackInfo`,
      {
        UserId: userId,
        MaxStreamingBitrate: options.maxBitrate || 100_000_000, // 100 Mbps
        AutoOpenLiveStream: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    type PlaybackMediaStream = {
      Type?: string;
      DeliveryUrl?: string;
      Index?: number;
      DisplayTitle?: string;
      Language?: string;
      IsDefault?: boolean;
    };
    type PlaybackMediaSource = {
      Id?: string;
      Container?: string;
      MediaStreams?: PlaybackMediaStream[];
      DirectStreamUrl?: string;
      TranscodingUrl?: string;
    };

    const mediaSource = playbackData.MediaSources?.[0] as unknown as PlaybackMediaSource | undefined;

    const baseUrl = this.baseUrl.replace(/\/+$/, '');
    const resolveUrl = (u?: string): string | undefined => {
      if (!u) return undefined;
      if (/^https?:\/\//i.test(u)) return u;
      if (u.startsWith('/')) return baseUrl + u;
      return baseUrl + '/' + u;
    };

    const directStreamUrl = resolveUrl(mediaSource?.DirectStreamUrl);
    const transcodingUrl = resolveUrl(mediaSource?.TranscodingUrl);
    const fallbackUrl = `${baseUrl}/Videos/${itemId}/stream?static=true&mediaSourceId=${itemId}`;
    const streamUrl = transcodingUrl || directStreamUrl || fallbackUrl;

    let containerFromUrl: string | undefined = undefined;
    try {
      const path = new URL(streamUrl).pathname.toLowerCase();
      if (path.endsWith('.m3u8')) containerFromUrl = 'm3u8';
      else if (path.endsWith('.flv')) containerFromUrl = 'flv';
      else if (path.endsWith('.mkv')) containerFromUrl = 'mkv';
      else if (path.endsWith('.mp4')) containerFromUrl = 'mp4';
    } catch {
      containerFromUrl = undefined;
    }

    const container = containerFromUrl || mediaSource?.Container || 'mp4';

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

    // 获取上次播放位置
    let initialPositionMs: number | undefined = undefined;
    const userData = (playbackData as any).UserData;
    if (userData?.PlaybackPositionTicks) {
      initialPositionMs = Math.floor(userData.PlaybackPositionTicks / 10_000);
    }

    return {
      streamUrl,
      subtitleUrls,
      audioTracks,
      container,
      isDirectPlay: !transcodingUrl,
      transcodingSessionId: transcodingUrl ? (playbackData as { PlaySessionId?: string })?.PlaySessionId : undefined,
      mediaSourceId: mediaSource?.Id || itemId,
      deviceId: 'tauri-desktop',
      accessToken: this.accessToken || '',
      playSessionId: (playbackData as { PlaySessionId?: string })?.PlaySessionId || `session-${Date.now()}`,
      initialPositionMs,
    };
  }

  async report(report: MediaPlaybackReport): Promise<void> {
    await this.ensureAuthenticated();

    const positionTicks = Math.max(0, Math.floor(report.positionMs * 10_000));
    const playbackStartTimeTicks = typeof report.playbackStartTime === 'number'
      ? Math.floor(report.playbackStartTime * 10_000)
      : undefined;

    const baseParams: Record<string, any> = {
      ItemId: report.itemId,
      MediaSourceId: report.itemId,
      PositionTicks: positionTicks,
      CanSeek: true,
      IsMuted: false,
      PlayMethod: 'DirectPlay',
      PlaybackStartTimeTicks: playbackStartTimeTicks
    };


    if (report.state === 'stopped') {
      await this.request(
        '/Sessions/Playing/Stopped',
        'POST',
        {
          params: {
            ...baseParams,
            EventName: 'Stop',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return;
    }

    const isPaused = report.state === 'paused';
    const endpoint = report.state === 'playing' && report.positionMs <= 1000
      ? '/Sessions/Playing'
      : '/Sessions/Playing/Progress';

    await this.request(
      endpoint,
      'POST',
      {
        data: {
          ...baseParams,
          IsPaused: isPaused,
          EventName: isPaused ? 'Pause' : 'TimeUpdate',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

}
