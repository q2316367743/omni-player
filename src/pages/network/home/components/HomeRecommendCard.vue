<template>
  <div
    class="recommend-card group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    @click="handleClick"
  >
    <!-- 封面图片 -->
    <div class="aspect-4/3 relative overflow-hidden bg-gray-100">
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
      
      <!-- 分类标签 -->
      <div
        v-if="item.category?.name"
        class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium"
      >
        {{ item.category.name }}
      </div>
      
      <!-- 播放来源标签 -->
      <div
        v-if="item.playFrom"
        class="absolute top-2 right-2 bg-brand-color bg-opacity-90 text-white px-2 py-1 rounded text-xs font-medium"
      >
        {{ item.playFrom }}
      </div>
      
      <!-- 更新时间 -->
      <div
        v-if="item.time"
        class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs"
      >
        {{ formatTime(item.time) }}
      </div>
    </div>
    
    <!-- 卡片信息 -->
    <div class="p-4 bg-white">
      <!-- 标题 -->
      <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-color transition-colors">
        {{ item.title }}
      </h3>
      
      <!-- 英文标题 -->
      <p v-if="item.titleEn" class="text-sm text-gray-600 mb-2 line-clamp-1">
        {{ item.titleEn }}
      </p>
      
      <!-- 备注信息 -->
      <div v-if="item.remark" class="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <t-icon name="info-circle" class="text-gray-400" />
        <span class="line-clamp-1">{{ item.remark }}</span>
      </div>
      
      <!-- 底部操作区 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <t-icon name="time" class="text-gray-400" />
          <span>{{ item.time }}</span>
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
import type { NetworkRecommend } from '@/modules/network/types/NetworkRecommend';

interface Props {
  item: NetworkRecommend;
}

const props = defineProps<Props>();

// 格式化时间
const formatTime = (time: string): string => {
  // 如果是最近的时间，显示相对时间
  const now = new Date();
  const itemTime = new Date(time);
  const diffMs = now.getTime() - itemTime.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return time;
  }
};

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  img.nextElementSibling?.classList.remove('hidden');
};

// 处理卡片点击
const handleClick = () => {
  // 这里可以添加跳转逻辑
  console.log('点击推荐视频:', props.item);
};
</script>

<style scoped>
/* 使用 aspect ratio 工具类 */
.aspect-4\/3 {
  aspect-ratio: 4/3;
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

.recommend-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
}

.recommend-card:hover {
  border-color: var(--td-brand-color);
}
</style>