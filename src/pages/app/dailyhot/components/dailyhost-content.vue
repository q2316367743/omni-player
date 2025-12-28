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
import {formatDate, prettyBetweenTime} from "@/util/lang/FormatUtil.ts";
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
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .content-header {
    position: sticky;
    top: 0;
    left: 0;
    padding: 12px 16px 11px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--td-bg-color-container);

    .platform-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--td-text-color-primary);
    }

    .update-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--td-text-color-secondary);
    }
  }

  .hot-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px 20px 20px;

    .hot-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      margin-bottom: 12px;
      background-color: var(--td-bg-color-component);
      border: 1px solid var(--td-border-level-1-color);
      border-radius: var(--td-radius-default);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--td-brand-color);
        box-shadow: 0 2px 8px var(--td-shadow-1);
        transform: translateY(-2px);
      }

      .hot-index {
        width: 28px;
        height: 28px;
        min-width: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        background-color: var(--td-bg-color-secondarycontainer);
        color: var(--td-text-color-secondary);
        border-radius: 50%;

        &.top-three {
          background: linear-gradient(135deg, var(--td-brand-color), var(--td-brand-color-7));
          color: var(--td-text-color-anti);
        }
      }

      .hot-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;

        .hot-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--td-text-color-primary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hot-desc {
          font-size: 13px;
          color: var(--td-text-color-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hot-meta {
          display: flex;
          gap: 16px;
          align-items: center;

          .hot-value,
          .hot-time {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--td-text-color-placeholder);
          }

          .hot-value {
            color: var(--td-error-color);
          }
        }
      }

      .hot-cover {
        width: 80px;
        height: 60px;
        min-width: 80px;
        border-radius: var(--td-radius-small);
        overflow: hidden;
        background-color: var(--td-bg-color-secondarycontainer);

        :deep(.t-image) {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
