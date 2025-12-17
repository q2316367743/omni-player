<template>
  <div
    class="video-card group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    @click="handleClick"
  >
    <!-- 封面图片 -->
    <div class="aspect-2/3 relative overflow-hidden bg-gray-100">
      <img
        v-if="item.cover"
        :src="item.cover"
        :alt="item.title"
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
      
      <!-- 类型标签 -->
      <div
        class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium"
      >
        {{ item.type === 'Movie' ? '电影' : '剧集' }}
      </div>
      
      <!-- 备注标签（更新状态） -->
      <div
        v-if="item.remark"
        class="absolute top-2 right-2 bg-brand-color bg-opacity-90 text-white px-2 py-1 rounded text-xs font-medium"
      >
        {{ item.remark }}
      </div>
      
      <!-- 集数信息 -->
      <div
        v-if="item.type === 'Series' && item.total"
        class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs"
      >
        {{ item.total }}集
      </div>
      
      <!-- 时长信息 -->
      <div
        v-if="item.duration && item.type === 'Movie'"
        class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs"
      >
        {{ item.duration }}
      </div>
    </div>
    
    <!-- 卡片信息 -->
    <div class="p-4 bg-white">
      <!-- 标题和副标题 -->
      <h3 class="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-brand-color transition-colors">
        {{ item.title }}
      </h3>
      <p v-if="item.subtitle" class="text-sm text-gray-600 mb-2 line-clamp-1">
        {{ item.subtitle }}
      </p>
      
      <!-- 元信息 -->
      <div class="flex items-center gap-3 text-sm text-gray-600 mb-3">
        <span v-if="item.releaseYear" class="flex items-center gap-1">
          <t-icon name="calendar" class="text-gray-400" />
          {{ item.releaseYear }}
        </span>
        <span v-if="item.region" class="flex items-center gap-1">
          <t-icon name="location" class="text-gray-400" />
          {{ item.region }}
        </span>
        <span v-if="item.language" class="flex items-center gap-1">
          <t-icon name="translate" class="text-gray-400" />
          {{ item.language }}
        </span>
      </div>
      
      <!-- 标签类型 -->
      <div v-if="item.types?.length" class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="type in item.types.slice(0, 3)"
          :key="type"
          class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
        >
          {{ type }}
        </span>
      </div>
      
      <!-- 演员信息 -->
      <div v-if="item.actors?.length" class="mb-3">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <t-icon name="user-group" class="text-gray-400" />
          <span class="line-clamp-1">
            <span class="font-medium">主演：</span>{{ item.actors.slice(0, 3).join(', ') }}
          </span>
        </div>
      </div>
      
      <!-- 导演信息 -->
      <div v-if="item.directors?.length" class="mb-3">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <t-icon name="user" class="text-gray-400" />
          <span class="line-clamp-1">
            <span class="font-medium">导演：</span>{{ item.directors.slice(0, 2).join(', ') }}
          </span>
        </div>
      </div>
      
      <!-- 底部操作区 -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <t-icon name="video" class="text-gray-400" />
          <span>{{ item.chapters?.length || 0 }}个播放源</span>
        </div>
        
        <t-button
          theme="primary"
          size="small"
          shape="round"
          class="shadow-md group-hover:shadow-lg transition-shadow"
        >
          <t-icon name="play" class="mr-1" />
          播放
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NetworkListItem } from '@/modules/network/types/NetworkListItem';

interface Props {
  item: NetworkListItem;
}

const props = defineProps<Props>();

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  img.nextElementSibling?.classList.remove('hidden');
};

// 处理卡片点击
const handleClick = () => {
  // 这里可以添加跳转逻辑
  console.log('点击视频:', props.item);
};
</script>

<style scoped>
/* 使用 aspect ratio 工具类 */
.aspect-2\/3 {
  aspect-ratio: 2/3;
}

/* 文字截断 */
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

.video-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
}

.video-card:hover {
  border-color: var(--td-brand-color);
}
</style>