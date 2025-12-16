<template>
  <div
    class="media-card group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    @click="$emit('click', item)"
    @mouseenter="$emit('mouseenter', item)"
    @mouseleave="$emit('mouseleave', item)"
  >
    <!-- 海报图片 -->
    <div class="aspect-2/3 relative overflow-hidden bg-gray-100">
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
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <t-icon name="image" class="text-4xl text-gray-300" />
      </div>
      
      <!-- 悬停遮罩层 -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      
      <!-- 评分标签 -->
      <div
        v-if="item.rating"
        class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
      >
        <t-icon name="star-filled" class="text-yellow-600" />
        {{ item.rating.toFixed(1) }}
      </div>
      
      <!-- 媒体类型标签 -->
      <div
        class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium"
      >
        {{ getTypeLabel(item.type) }}
      </div>
    </div>
    
    <!-- 卡片信息 -->
    <div class="p-4 bg-white">
      <!-- 标题 -->
      <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {{ item.name }}
      </h3>
      
      <!-- 元信息 -->
      <div class="flex items-center gap-3 text-sm text-gray-600 mb-3">
        <span v-if="item.year" class="flex items-center gap-1">
          <t-icon name="calendar" class="text-gray-400" />
          {{ item.year }}
        </span>
        <span v-if="item.runtimeSeconds" class="flex items-center gap-1">
          <t-icon name="time" class="text-gray-400" />
          {{ formatDuration(item.runtimeSeconds) }}
        </span>
      </div>
      
      <!-- 类型标签 -->
      <div v-if="item.genres?.length" class="flex flex-wrap gap-2">
        <span
          v-for="genre in item.genres.slice(0, 2)"
          :key="genre"
          class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
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
        class="shadow-lg"
      >
        <t-icon name="play" />
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from '@/modules/media/types/media/MediaItem';

interface Props {
  item: MediaItem;
}

interface Emits {
  click: [item: MediaItem];
  mouseenter: [item: MediaItem];
  mouseleave: [item: MediaItem];
}

defineProps<Props>();
defineEmits<Emits>();

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
</style>