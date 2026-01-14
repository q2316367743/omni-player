<template>
  <MediaWall
    :key="clientId"
    :client-id="clientId"
    :sort-by-storage-key="`${LocalName.PAGE_MEDIA_HOME_SORT_BY}/${clientId}`"
    :sort-order-storage-key="`${LocalName.PAGE_MEDIA_HOME_SORT_ORDER}/${clientId}`"
    :options="{}"
  />
</template>

<script lang="ts" setup>
import { LocalName } from '@/global/LocalName.ts';
import MediaWall from '@/pages/media/components/MediaWall.vue';

defineOptions({ name: 'MediaHome' });

const route = useRoute();
const clientId = computed(() => route.params.id as string);

</script>
