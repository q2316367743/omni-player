// src/services/jellyfin/utils.ts

import type {MediaItemJellyfin} from '@/modules/media/types/media/MediaItem.jellyfin';
import type {MediaPersonJellyfin} from '@/modules/media/types/person/MediaPerson.jellyfin';

/**
 * 将 Jellyfin API 返回的 Item 转换为 MediaItemJellyfin
 */
export function normalizeMediaItem(item: any): MediaItemJellyfin {
  const typeMap: Record<string, MediaItemJellyfin['type']> = {
    Movie: 'Movie',
    Series: 'Series',
    Season: 'Season',
    Episode: 'Episode',
    Person: 'Person',
    CollectionFolder: 'Folder',
    Folder: 'Folder',
  };

  return {
    id: item.Id,
    name: item.Name || '',
    type: typeMap[item.Type] || 'Folder',
    year: item.ProductionYear,
    posterUrl: item.ImageTags?.Primary
      ? `${item.ServerUrl}/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}`
      : undefined,
    backdropUrl: item.ImageTags?.Backdrop
      ? `${item.ServerUrl}/Items/${item.Id}/Images/Backdrop?tag=${item.ImageTags.Backdrop}`
      : item.ImageTags?.Primary
        ? `${item.ServerUrl}/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}`
        : undefined,
    overview: item.Overview,
    rating: item.CommunityRating,
    runtimeSeconds: item.RunTimeTicks ? Math.floor(item.RunTimeTicks / 10_000_000) : undefined,
    genres: item.GenreItems?.map((g: any) => g.Name) || [],
    dateCreated: item.DateCreated,
    dateModified: item.DateLastSaved || item.DateCreated,
    parentId: item.ParentId,
    isFolder: item.IsFolder,
    childCount: item.ChildCount,
    providerIds: item.ProviderIds,
    userData: item.UserData,
    officialRating: item.OfficialRating,
    path: item.Path,
    extra: item,
  };
}

/**
 * 将 Jellyfin 的 Person 转换为 PersonJellyfin
 */
export function normalizePerson(person: any, serverUrl: string): MediaPersonJellyfin {
  return {
    id: person.Id,
    name: person.Name,
    type: 'Actor', // Jellyfin 不直接返回角色类型，前端可从关联项推断
    role: person.Role, // 如果有
    imageUrl: person.PrimaryImageTag
      ? `${serverUrl}/Items/${person.Id}/Images/Primary?tag=${person.PrimaryImageTag}`
      : undefined,
    birthYear: person.BirthYear,
    deathYear: person.EndYear,
    biography: person.Overview,
    movieCount: person.MovieCount,
    seriesCount: person.SeriesCount,
    primaryImageTag: person.PrimaryImageTag,
    extra: person,
  };
}