<template>
  <div
    class="media-card group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    @click="$emit('click', item)"
    @mouseenter="$emit('mouseenter', item)"
    @mouseleave="$emit('mouseleave', item)"
  >
    <!-- 海报图片 -->
    <div class="aspect-2/3 relative overflow-hidden bg-td-secondary">
      <img
        v-if="item.posterUrl"
        :src="item.posterUrl"
        :alt="item.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        @error="handleImageError"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/12 via-fuchsia-500/10 to-cyan-500/12 dark:from-indigo-400/20 dark:via-fuchsia-400/16 dark:to-cyan-400/20"
      >
        <t-icon name="image" class="text-4xl text-td-placeholder" />
      </div>
      
      <!-- 悬停遮罩层 -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      
      <div class="absolute top-2 right-2 flex flex-col items-end gap-2">
        <div
          v-if="seriesCountText"
          class="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium tabular-nums"
        >
          {{ seriesCountText }}
        </div>
        <div
          v-else-if="item.rating"
          class="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
        >
          <t-icon name="star-filled" class="text-yellow-600" />
          {{ item.rating.toFixed(1) }}
        </div>
      </div>
      
      <!-- 媒体类型标签 -->
      <div
        class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium"
      >
        {{ getTypeLabel(item.type) }}
      </div>
    </div>
    
    <!-- 卡片信息 -->
    <div class="p-4">
      <!-- 标题 -->
      <h3
        class="font-bold text-td-primary mb-2 line-clamp-2 group-hover:text-td-brand transition-colors"
      >
        {{ item.name }}
      </h3>
      
      <!-- 元信息 -->
      <div class="flex items-center gap-3 text-sm text-td-secondary mb-3">
        <span v-if="item.year" class="flex items-center gap-1">
          <t-icon name="calendar" class="text-td-placeholder" />
          {{ item.year }}
        </span>
        <span v-if="item.runtimeSeconds" class="flex items-center gap-1">
          <t-icon name="time" class="text-td-placeholder" />
          {{ formatDuration(item.runtimeSeconds) }}
        </span>
      </div>
      
      <!-- 类型标签 -->
      <div v-if="item.genres?.length" class="flex flex-wrap gap-2">
        <span
          v-for="genre in item.genres.slice(0, 2)"
          :key="genre"
          class="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium"
        >
          {{ genre }}
        </span>
      </div>
    </div>
    
    <!-- 悬停时显示的操作按钮 -->
    <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <t-button
        theme="primary"
        shape="circle"
        size="small"
        @click.stop="handlePlay()"
      >
        <play-icon />
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from '@/modules/media/types/media/MediaItem.ts';
import {PlayIcon} from "tdesign-icons-vue-next";
import {createWindows} from "@/lib/windows.ts";

const route = useRoute();

const clientId = route.params.id as string;

interface Props {
  item: MediaItem;
}

interface Emits {
  click: [item: MediaItem];
  mouseenter: [item: MediaItem];
  mouseleave: [item: MediaItem];
}

const props = defineProps<Props>();
defineEmits<Emits>();

const getFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
};

const getNumberProp = <T extends object>(obj: T, key: string): number | undefined => {
  return getFiniteNumber((obj as Record<string, unknown>)[key]);
};

const seriesCountText = computed(() => {
  if (props.item.type !== 'Series') return undefined;

  const totalEpisodes =
    getNumberProp(props.item, 'recursiveItemCount') ??
    getNumberProp(props.item, 'leafCount');

  if (totalEpisodes) return `${totalEpisodes}集`;

  const extra = props.item.extra;
  if (extra) {
    const extraEpisodes =
      getNumberProp(extra, 'RecursiveItemCount') ??
      getNumberProp(extra, 'leafCount') ??
      getNumberProp(extra, 'LeafCount');
    if (extraEpisodes) return `${extraEpisodes}集`;

    const seasons =
      getNumberProp(props.item, 'childCount') ??
      getNumberProp(extra, 'ChildCount');
    if (seasons) return `${seasons}季`;
  }

  const seasons = getNumberProp(props.item, 'childCount');
  if (seasons) return `${seasons}季`;

  return undefined;
});

// 格式化时长
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

// 获取媒体类型标签
const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'Movie': '电影',
    'Series': '剧集',
    'Season': '季',
    'Episode': '单集',
    'Person': '人物',
    'Collection': '合集',
    'Folder': '文件夹'
  };
  return labels[type] || type;
};

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  img.nextElementSibling?.classList.remove('hidden');
};

const handlePlay = () => {
  // 这里可以添加播放逻辑
  createWindows("media", {
    title: props.item.name,
    serverId: clientId,
    mediaId: props.item.id,
    itemId: props.item.id
  })
};
</script>

<style scoped>
/* 使用 aspect ratio 工具类 */
.aspect-2\/3 {
  aspect-ratio: 2/3;
}

/* 文字截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
}

.media-card:hover {
  border-color: var(--td-brand-color);
}
</style>
