
export interface MediaSeason {
  items: Array<MediaSeasonItem>;
  totalRecordCount: number;
  startIndex: number;
}

interface MediaSeasonItem {
  id: string;
  name: string;
  indexNumber: number;
  ServerId: string;
  CanDelete: boolean;
  ChannelId?: any;
  IsFolder: boolean;
  Type: string;
  UserData: MediaSeasonUserData;
  SeriesName: string;
  SeriesId: string;
  ImageTags: ImageTags;
  BackdropImageTags: any[];
  ImageBlurHashes: ImageTags;
  LocationType: string;
  MediaType: string;
}

interface ImageTags {
}

interface MediaSeasonUserData {
  UnplayedItemCount: number;
  PlaybackPositionTicks: number;
  PlayCount: number;
  IsFavorite: boolean;
  Played: boolean;
  Key: string;
}