<template>
  <div
    class="aggregation-card group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    @click="handleClick">
    <div class="aspect-2/3 relative overflow-hidden bg-td-secondary">
      <img v-if="currentItem?.cover" :src="currentItem.cover" :alt="currentItem?.title"
           class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy"
           @error="handleImageError"/>
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/12 via-fuchsia-500/10 to-cyan-500/12 dark:from-indigo-400/20 dark:via-fuchsia-400/16 dark:to-cyan-400/20 text-td-placeholder"
      >
        <image-icon/>
      </div>

      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"/>

      <div v-if="currentItem?.type === 'Movie'" class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
        {{ currentItem?.type === 'Movie' ? '电影' : '剧集' }}
      </div>

      <div v-if="currentItem?.remark"
           class="absolute top-2 right-2 bg-td-brand/90 text-white px-2 py-1 rounded text-xs font-medium">
        {{ currentItem?.remark }}
      </div>

      <div v-if="currentItem?.type === 'Series' && currentItem?.total"
           class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {{ currentItem?.total }}集
      </div>

      <div v-if="currentItem?.duration && currentItem?.type === 'Movie'"
           class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {{ currentItem?.duration }}
      </div>

      <div v-if="aggregationItem.items.length > 1"
           class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        {{ aggregationItem.items.length }}个资源
      </div>
    </div>

    <div class="p-4">
      <h3
        class="font-bold text-td-primary mb-1 line-clamp-2 group-hover:text-td-brand transition-colors"
      >
        {{ currentItem?.title }}
      </h3>
      <p v-if="currentItem?.subtitle" class="text-sm text-td-secondary mb-2 line-clamp-1">
        {{ currentItem?.subtitle }}
      </p>

      <div class="flex items-center gap-3 text-sm text-td-secondary mb-3">
        <span v-if="currentItem?.releaseYear" class="flex items-center gap-1">
          <calendar-icon/>
          {{ currentItem?.releaseYear }}
        </span>
        <span v-if="currentItem?.region" class="flex items-center gap-1">
          <location-icon/>
          {{ currentItem?.region }}
        </span>
      </div>

      <div v-if="currentItem?.types?.length" class="flex flex-wrap gap-1 mb-3">
        <span v-for="type in currentItem?.types?.slice(0, 3)" :key="type"
              class="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
          {{ type }}
        </span>
      </div>

      <div v-if="aggregationItem.items.length > 1" class="mb-3">
        <div class="flex items-center gap-2 text-sm text-td-secondary">
          <server-icon/>
          <span class="line-clamp-1">
            <span class="font-medium">来源：</span>{{ currentServerName }}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-td-1">
        <div v-if="aggregationItem.items.length > 1" class="flex items-center gap-2" @click.stop>
          <t-dropdown :options="serverOptions" trigger="click" @click="handleServerChange">
            <t-button size="small" variant="text">
              <template #icon>
                <swap-icon/>
              </template>
              切换资源
            </t-button>
          </t-dropdown>
        </div>

        <t-button theme="primary" size="small" shape="round" @click.stop="handlePlay()">
          <template #icon>
            <play-icon/>
          </template>
          播放
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CalendarIcon,
  ImageIcon,
  LocationIcon,
  PlayIcon,
  SwapIcon,
  ServerIcon
} from "tdesign-icons-vue-next"
import type {NetworkListItem} from '@/modules/network/types/NetworkListItem.ts';
import {createWindows} from "@/lib/windows.ts";
import {setNetworkListItem} from "@/pages/network/components/detail.ts";
import {openNetworkDetail} from "@/pages/network/detail/network-detail.tsx";

interface AggregatedItem {
  title: string;
  items: Array<{
    item: NetworkListItem;
    serverId: string;
    serverName: string;
  }>;
}

interface Props {
  aggregationItem: AggregatedItem;
}

const router = useRouter();

const props = defineProps<Props>();

const currentIndex = ref(0);

const currentItem = computed(() => props.aggregationItem.items[currentIndex.value]?.item);
const currentServerName = computed(() => props.aggregationItem.items[currentIndex.value]?.serverName);

const serverOptions = computed(() => {
  return props.aggregationItem.items.map((item, index) => ({
    content: item.serverName,
    value: index
  }));
});

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  img.nextElementSibling?.classList.remove('hidden');
};

const handleClick = () => {
  const currentItemData = props.aggregationItem.items[currentIndex.value];
  if (currentItemData) {
    // router.push(`/network/${currentItemData.serverId}/detail/${currentItemData.item.id}`);
    // setNetworkListItem(currentItemData.item);
    openNetworkDetail(currentItemData.serverId, currentItemData.item)
  }
};

const handleServerChange = (dropdownItem: any) => {
  currentIndex.value = dropdownItem.value as number;
};

const handlePlay = () => {
  const currentItemData = props.aggregationItem.items[currentIndex.value];
  if (currentItemData) {
    createWindows("network", {
      title: currentItemData.item.title,
      serverId: currentItemData.serverId,
      mediaId: currentItemData.item.id,
      itemId: currentItemData.item.id,
      item: currentItemData.item
    });
  }
};
</script>

<style scoped>
.aspect-2\/3 {
  aspect-ratio: 2/3;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aggregation-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
}

.aggregation-card:hover {
  border-color: var(--td-brand-color);
}
</style>
