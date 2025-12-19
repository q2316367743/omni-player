<template>
  <div
    class="video-card group relative overflow-hidden rounded-lg  shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    @click="handleClick">
    <!-- 封面图片 -->
    <div class="aspect-2/3 relative overflow-hidden bg-td-secondary">
      <img v-if="item.cover" :src="item.cover" :alt="item.title"
           class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy"
           @error="handleImageError"/>
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/12 via-fuchsia-500/10 to-cyan-500/12 dark:from-indigo-400/20 dark:via-fuchsia-400/16 dark:to-cyan-400/20 text-td-placeholder"
      >
        <image-icon/>
      </div>

      <!-- 悬停遮罩层 -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"/>

      <!-- 类型标签 -->
      <div class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
        {{ item.type === 'Movie' ? '电影' : '剧集' }}
      </div>

      <!-- 备注标签（更新状态） -->
      <div v-if="item.remark"
           class="absolute top-2 right-2 bg-td-brand/90 text-white px-2 py-1 rounded text-xs font-medium">
        {{ item.remark }}
      </div>

      <!-- 集数信息 -->
      <div v-if="item.type === 'Series' && item.total"
           class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {{ item.total }}集
      </div>

      <!-- 时长信息 -->
      <div v-if="item.duration && item.type === 'Movie'"
           class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {{ item.duration }}
      </div>
    </div>

    <!-- 卡片信息 -->
    <div class="p-4">
      <!-- 标题和副标题 -->
      <h3
        class="font-bold text-td-primary mb-1 line-clamp-2 group-hover:text-td-brand transition-colors"
      >
        {{ item.title }}
      </h3>
      <p v-if="item.subtitle" class="text-sm text-td-secondary mb-2 line-clamp-1">
        {{ item.subtitle }}
      </p>

      <!-- 元信息 -->
      <div class="flex items-center gap-3 text-sm text-td-secondary mb-3">
        <span v-if="item.releaseYear" class="flex items-center gap-1">
          <calendar-icon/>
          {{ item.releaseYear }}
        </span>
        <span v-if="item.region" class="flex items-center gap-1">
          <location-icon/>
          {{ item.region }}
        </span>
        <span v-if="item.language" class="flex items-center gap-1">
          <translate-icon/>
          {{ item.language }}
        </span>
      </div>

      <!-- 标签类型 -->
      <div v-if="item.types?.length" class="flex flex-wrap gap-1 mb-3">
        <span v-for="type in item.types.slice(0, 3)" :key="type"
              class="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
          {{ type }}
        </span>
      </div>

      <!-- 演员信息 -->
      <div v-if="item.actors?.length" class="mb-3">
        <div class="flex items-center gap-2 text-sm text-td-secondary">
          <usergroup-icon/>
          <span class="line-clamp-1">
            <span class="font-medium">主演：</span>{{ item.actors.slice(0, 3).join(', ') }}
          </span>
        </div>
      </div>

      <!-- 导演信息 -->
      <div v-if="item.directors?.length" class="mb-3">
        <div class="flex items-center gap-2 text-sm text-td-secondary">
          <user-icon/>
          <span class="line-clamp-1">
            <span class="font-medium">导演：</span>{{ item.directors.slice(0, 2).join(', ') }}
          </span>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="flex items-center justify-between pt-3 border-t border-td-1">
        <div class="flex items-center gap-2 text-xs text-td-secondary">
          <video-icon/>
          <span>{{ item.chapters?.length || 0 }}个播放源</span>
        </div>

        <t-button theme="primary" size="small" shape="round" @click.stop="handlePlayer()">
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
  TranslateIcon,
  UsergroupIcon,
  UserIcon,
  VideoIcon
} from "tdesign-icons-vue-next"
import type {NetworkListItem} from '@/modules/network/types/NetworkListItem';
import {setNetworkListItem} from '../../components/detail';
import {createWindows} from "@/lib/windows.ts";

interface Props {
  item: NetworkListItem;
}

const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const networkId = route.params.id as string;

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  img.nextElementSibling?.classList.remove('hidden');
};

// 处理卡片点击
const handleClick = () => {
  // 这里可以添加跳转逻辑
  setNetworkListItem(props.item);
  router.push(`/network/${networkId}/detail/${props.item.id}`);
};

const handlePlayer = () => {
  createWindows("network", {
    title: props.item.title,
    serverId: networkId,
    mediaId: props.item.id,
    itemId: props.item.id,
    item: props.item
  })
}
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
