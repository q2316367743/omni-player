<template>
  <MediaWall
    :key="clientId"
    :client-id="clientId"
    :sort-by-storage-key="`${LocalName.PAGE_MEDIA_SERIES_SORT_BY}/${clientId}`"
    :sort-order-storage-key="`${LocalName.PAGE_MEDIA_SERIES_SORT_ORDER}/${clientId}`"
    :options="{type: 'Series'}"
  />
</template>

<script lang="ts" setup>
import {LocalName} from '@/global/LocalName.ts';
import MediaWall from '@/pages/media/components/MediaWall.vue';

defineOptions({name: 'MediaSeries'});

const route = useRoute();
const clientId = computed(() => route.params.id as string);
</script>
