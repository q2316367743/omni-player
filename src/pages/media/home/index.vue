<template>
  <MediaWall
    :key="clientId"
    :client-id="clientId"
    :sort-by-storage-key="`${LocalName.PAGE_MEDIA_HOME_SORT_BY}/${clientId}`"
    :sort-order-storage-key="`${LocalName.PAGE_MEDIA_HOME_SORT_ORDER}/${clientId}`"
    :fetch-page="fetchPage"
  />
</template>

<script lang="ts" setup>
import type { IMediaServer } from '@/modules/media/IMediaServer.ts';
import type { MediaItem } from '@/modules/media/types/media/MediaItem.ts';
import type { PaginatedResult, PaginationOptions } from '@/modules/media/types/common/MediaPage.ts';
import { LocalName } from '@/global/LocalName.ts';
import MediaWall from '@/pages/media/components/MediaWall.vue';

defineOptions({ name: 'MediaHome' });

const route = useRoute();
const clientId = computed(() => route.params.id as string);

const fetchPage = (client: IMediaServer, options: PaginationOptions): Promise<PaginatedResult<MediaItem>> => {
  return client.getItems(options);
};
</script>
