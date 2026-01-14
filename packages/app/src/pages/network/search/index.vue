<template>
  <div class="network-search-container h-full overflow-auto" ref="containerRef">
    <!-- 粘性页面头部 -->
    <div class="sticky-header">

      <!-- 搜索框 -->
      <div class="search-section">
        <t-input
          v-model="keyword"
          placeholder="请输入搜索关键字"
          size="large"
          clearable
          @enter="handleSearch"
        >
          <template #suffix-icon>
            <t-icon name="search" @click="handleSearch"/>
          </template>
        </t-input>
        <t-button theme="primary" size="large" @click="handleSearch" :loading="loading">
          搜索
        </t-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 初始加载状态 -->
      <t-loading v-if="loading && items.length === 0" text="正在搜索..." class="w-full"/>

      <!-- 空状态提示 -->
      <div v-else-if="!hasSearched && items.length === 0" class="empty-container">
        <t-icon name="search" class="empty-icon"/>
        <p class="empty-message">请输入关键字开始搜索</p>
      </div>

      <!-- 无搜索结果 -->
      <div v-else-if="hasSearched && items.length === 0 && !loading" class="empty-container">
        <t-icon name="info-circle" class="empty-icon"/>
        <p class="empty-message">未找到相关视频</p>
        <p class="empty-hint">请尝试其他关键字</p>
      </div>

      <!-- 视频网格 -->
      <div v-else class="video-content">
        <div class="search-info" v-if="hasSearched">
          <span class="info-text">
            <t-icon name="video"/>
            找到 {{ total }} 部作品
          </span>
        </div>

        <div class="video-grid">
          <NetworkVideoCard v-for="item in items" :item="item" :key="`video-${item.id}`"/>
        </div>

        <!-- 加载更多提示 -->
        <t-loading v-if="loadingMore" text="正在加载更多..." size="small" class="w-full"/>

        <!-- 加载完成提示 -->
        <div v-if="!hasMore && items.length > 0" class="load-complete">
          <t-icon name="check-circle" class="complete-icon"/>
          <span>已加载全部 {{ total }} 部作品</span>
        </div>

        <!-- 加载更多错误 -->
        <div v-if="loadMoreError" class="load-more-error">
          <p class="error-text">{{ loadMoreError }}</p>
          <t-button theme="primary" size="small" @click="loadMoreData">重试</t-button>
        </div>
      </div>
    </div>
    <t-back-top container=".network-search-container"/>
  </div>
</template>

<script setup lang="ts">
import {useNetworkServerStore} from '@/store';
import type {INetworkServer} from '@/modules/network/INetworkServer';
import type {NetworkListItem} from '@/modules/network/types/NetworkListItem';
import MessageUtil from "@/util/model/MessageUtil.ts";

const route = useRoute();

// 网络服务ID
const networkId = route.params.id as string;

// 搜索状态
const keyword = ref('');
const hasSearched = ref(false);

// 无限滚动状态
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const hasMore = ref(true);

// 数据状态
const items = ref<NetworkListItem[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const loadMoreError = ref<string>('');

// DOM引用
const containerRef = ref<HTMLElement>();
// 网络服务客户端
const client = ref<INetworkServer>();

// 滚动节流控制
let isLoading = false;

// 执行搜索
const handleSearch = async () => {
  if (!keyword.value.trim()) {
    MessageUtil.warning('请输入搜索关键字');
    return;
  }

  if (isLoading) return;

  loading.value = true;
  hasSearched.value = true;
  isLoading = true;

  try {
    client.value = await useNetworkServerStore().getServerClient(networkId);

    const res = await client.value.searchVideos(keyword.value.trim(), 1);

    items.value = res.data;
    total.value = res.total;
    hasMore.value = res.data.length >= pageSize.value;
    page.value = 1;
    loadMoreError.value = '';

    // 滚动到顶部
    if (containerRef.value) {
      containerRef.value.scrollTo({top: 0, behavior: 'smooth'});
    }
  } catch (err) {
    loadMoreError.value = err instanceof Error ? err.message : '搜索失败';
    MessageUtil.error('搜索失败');
  } finally {
    loading.value = false;
    isLoading = false;
  }
};

// 加载更多数据
const loadMoreData = async () => {
  if (isLoading || !hasMore.value || loadingMore.value || !hasSearched.value) {
    return;
  }

  loadingMore.value = true;
  loadMoreError.value = '';
  isLoading = true;

  try {
    const nextPage = page.value + 1;

    if (!client.value) {
      client.value = await useNetworkServerStore().getServerClient(networkId);
    }

    const res = await client.value.searchVideos(keyword.value.trim(), nextPage);

    items.value.push(...res.data);
    total.value = res.total;
    hasMore.value = res.data.length >= pageSize.value;
    page.value = nextPage;

  } catch (err) {
    loadMoreError.value = err instanceof Error ? err.message : '加载更多数据失败';
    MessageUtil.error('加载更多数据失败');
  } finally {
    loadingMore.value = false;
    isLoading = false;
  }
};

// 无限滚动
useInfiniteScroll(containerRef, loadMoreData, {
  distance: 10
});

// 监听路由参数变化
onMounted(() => {
  // 重置所有状态
  keyword.value = '';
  hasSearched.value = false;
  page.value = 1;
  total.value = 0;
  hasMore.value = true;
  items.value = [];
  loadMoreError.value = '';
})
</script>

<script lang="ts">
export default {
  name: "NetworkSearch"
}
</script>

<style scoped lang="less">
.network-search-container {
  background: linear-gradient(135deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
  padding: 0;
}

/* 粘性头部样式 */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--td-border-level-1-color);
  padding: 16px;
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto 16px;
}

.page-title {
  font-weight: 700;
  background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-hover) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.search-section {
  display: flex;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

/* 内容区域布局 */
.content-area {
  padding: 0 24px;
  min-height: calc(100vh - 200px);
}

/* 视频内容区域 */
.video-content {
  max-width: 1400px;
  margin: 0 auto;
}

.search-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-border-level-1-color);
}

.info-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.empty-icon {
  font-size: 64px;
  color: var(--td-text-color-placeholder);
}

.empty-message {
  color: var(--td-text-color-secondary);
  font-size: 18px;
  margin: 0;
}

.empty-hint {
  color: var(--td-text-color-placeholder);
  font-size: 14px;
  margin: 0;
}

.load-complete {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
  gap: 8px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.complete-icon {
  font-size: 20px;
  color: var(--td-success-color);
}

.load-more-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  gap: 16px;
}

.error-text {
  color: var(--td-error-color);
  font-size: 14px;
  margin: 0;
}

// 响应式设计
@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .network-search-container {
    padding: 16px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .content-area {
    padding: 0;
  }

  .search-section {
    flex-direction: column;
    gap: 8px;
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .sticky-header {
    padding: 16px 16px 12px;
  }
}
</style>
