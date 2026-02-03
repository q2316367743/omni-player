<template>
  <t-loading :loading class="hot-content">
    <div v-if="selectedPlatform" class="content-header">
      <div class="platform-title">{{ selectedPlatform }}</div>
      <div class="update-time">
        <time-icon size="16px"/>
        <span>{{ updateTime }}</span>
      </div>
    </div>
    <div v-if="hotList.length > 0" class="hot-list">
      <t-back-top container=".hot-list"/>
      <div
        v-for="(item, index) in hotList"
        :key="item.id"
        class="hot-item"
        @click="openLink(item.url)"
      >
        <div class="hot-index" :class="getHotIndexClass(index)">{{ index + 1 }}</div>
        <div class="hot-info">
          <div class="hot-title">{{ item.title }}</div>
          <div v-if="item.desc" class="hot-desc">{{ item.desc }}</div>
          <div class="hot-meta">
                    <span v-if="item.hot" class="hot-value">
                      {{ item.hot }}
                    </span>
            <span v-if="item.timestamp" class="hot-time">
                      <time-icon size="14px"/>
                      {{ prettyBetweenTime(item.timestamp) }}
                    </span>
          </div>
        </div>
        <div v-if="item.cover" class="hot-cover">
          <t-image :src="item.cover" fit="cover" lazy/>
        </div>
      </div>
    </div>
    <div v-else-if="selectedPlatform" class="empty-state">
      <t-empty description="暂无数据"/>
    </div>
    <div v-else class="empty-state">
      <t-empty description="请选择一个平台查看热榜"/>
    </div>
  </t-loading>
</template>
<script lang="ts" setup>
import {openUrl} from "@tauri-apps/plugin-opener";
import {TimeIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {formatDate, prettyBetweenTime} from "@/util/lang/DateUtil.ts";
import {useNewsService} from "@/modules/news/NewsFactory.ts";
import type {NewItem} from "@/modules/news/INewsService.ts";

const props = defineProps({
  selectedPlatform: {
    type: String,
    default: ''
  }
});

const updateTime = ref('');
const hotList = ref<NewItem[]>([]);
const loading = ref(false);

const getHotIndexClass = (index: number) => {
  if (index < 3) return 'top-three';
  return '';
};

const fetchHotList = async (platform: string) => {
  loading.value = true;
  try {
    hotList.value = await useNewsService().getNews(platform);
    updateTime.value = formatDate(new Date());
  } catch (error) {
    console.error('获取热榜数据错误:', error);
    MessageUtil.error('网络请求失败');
    hotList.value = [];
  } finally {
    loading.value = false;
  }
};

const openLink = (url?: string) => {
  if (url) {
    openUrl(url);
  }
};

watch(() => props.selectedPlatform, async (platform) => {
  if (platform) {
    await fetchHotList(platform);
  }
}, {immediate: true})
</script>
<style scoped lang="less">
.hot-content {
  height: calc(100vh - 57px);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .content-header {
    position: sticky;
    top: 0;
    left: 0;
    padding: 16px 24px;
    border-bottom: 1px solid var(--fluent-border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--fluent-card-bg);
    backdrop-filter: var(--fluent-acrylic-blur);
    z-index: 1;
    transition: all var(--fluent-transition-normal);

    .platform-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      letter-spacing: -0.01em;
    }

    .update-time {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--td-text-color-placeholder);
      padding: 4px 12px;
      background: var(--fluent-card-bg);
      border-radius: var(--fluent-radius-smooth);
      border: 1px solid var(--fluent-border-subtle);
      transition: all var(--fluent-transition-normal);

      &:hover {
        background: var(--fluent-card-bg-hover);
        border-color: var(--fluent-border-subtle-dark);
      }
    }
  }

  .hot-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px 24px;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--td-scrollbar-color);
      border-radius: 4px;
      transition: background var(--fluent-transition-fast);

      &:hover {
        background: var(--td-scrollbar-hover-color);
      }
    }

    .hot-item {
      position: relative;
      display: flex;
      gap: 16px;
      padding: 20px;
      margin-bottom: 16px;
      background: var(--fluent-card-bg);
      border: 1px solid var(--fluent-card-border);
      border-radius: var(--fluent-radius-card);
      cursor: pointer;
      transition: all var(--fluent-transition-normal);
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--fluent-reveal-bg);
        opacity: 0;
        transition: opacity var(--fluent-transition-fast);
        pointer-events: none;
      }

      &:hover {
        border-color: var(--fluent-accent-color);
        box-shadow: var(--fluent-card-shadow-hover);
        transform: translateY(-2px) scale(1.01);

        &::before {
          opacity: 1;
        }
      }

      &:active {
        transform: translateY(0) scale(1);
        box-shadow: var(--fluent-card-shadow);
      }

      .hot-index {
        position: relative;
        width: 36px;
        height: 36px;
        min-width: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 700;
        background: var(--fluent-card-bg-hover);
        color: var(--td-text-color-secondary);
        border-radius: var(--fluent-radius-smooth);
        border: 1px solid var(--fluent-border-subtle);
        transition: all var(--fluent-transition-normal);

        &.top-three {
          background: var(--fluent-gradient-primary);
          color: var(--td-text-color-anti);
          border: none;
          box-shadow: var(--fluent-elevation-2);
        }
      }

      .hot-info {
        position: relative;
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .hot-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--td-text-color-primary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          letter-spacing: -0.01em;
          transition: color var(--fluent-transition-fast);

          &:hover {
            color: var(--fluent-accent-color);
          }
        }

        .hot-desc {
          font-size: 14px;
          color: var(--td-text-color-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hot-meta {
          display: flex;
          gap: 20px;
          align-items: center;
          margin-top: auto;

          .hot-value,
          .hot-time {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--td-text-color-placeholder);
            padding: 4px 10px;
            background: var(--fluent-card-bg-hover);
            border-radius: var(--fluent-radius-smooth);
            border: 1px solid var(--fluent-border-subtle);
            transition: all var(--fluent-transition-normal);
          }

          .hot-value {
            color: var(--td-error-color);
            background: rgba(232, 17, 35, 0.08);
            border-color: rgba(232, 17, 35, 0.2);
            font-weight: 500;
          }
        }
      }

      .hot-cover {
        position: relative;
        width: 96px;
        height: 72px;
        min-width: 96px;
        border-radius: var(--fluent-radius-smooth);
        overflow: hidden;
        background: var(--fluent-card-bg-hover);
        border: 1px solid var(--fluent-border-subtle);
        transition: all var(--fluent-transition-normal);

        &:hover {
          box-shadow: var(--fluent-elevation-1);
        }

        :deep(.t-image) {
          width: 100%;
          height: 100%;
          transition: transform var(--fluent-transition-slow);

          img {
            transition: transform var(--fluent-transition-slow);
          }

          &:hover img {
            transform: scale(1.05);
          }
        }
      }
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--fluent-card-bg);
    border-radius: var(--fluent-radius-card);
    margin: 16px 24px;
    border: 1px dashed var(--fluent-border-subtle);
  }
}
</style>
