export interface MediaEpisode {
  items: MediaEpisodeItem[];
  totalRecordCount: number;
  startIndex: number;
}

interface MediaEpisodeItem {
  id: string;
  name: string;
  ServerId: string;
  CanDelete: boolean;
  HasSubtitles?: boolean;
  Container: string;
  ChannelId?: any;
  RunTimeTicks: number;
  IndexNumber: number;
  ParentIndexNumber: number;
  IsFolder: boolean;
  Type: string;
  UserData: UserData;
  SeriesName: string;
  SeriesId: string;
  SeasonId?: any;
  SeasonName: string;
  VideoType: string;
  ImageTags: ImageTags;
  BackdropImageTags: any[];
  ImageBlurHashes: ImageBlurHashes;
  LocationType: string;
  MediaType: string;
  PrimaryImageAspectRatio?: PrimaryImageAspectRatio | number;
}

interface PrimaryImageAspectRatio {
  s: number;
  e: number;
  c: number[];
}

interface ImageBlurHashes {
  Primary?: Record<string, string>;
}


interface ImageTags {
  Primary?: string;
}

interface UserData {
  PlaybackPositionTicks: number;
  PlayCount: number;
  IsFavorite: boolean;
  LastPlayedDate?: string;
  Played: boolean;
  Key: string;
}