<template>
  <div class="media-wall-container h-full overflow-auto" ref="mediaWallContainerRef">
    <!-- 粘性页面头部 -->
    <div class="sticky-header">
      <div class="page-header">
        <div class="sort-controls">
          <t-select
            v-model="sortBy"
            :options="sortOptions"
            size="medium"
            :clearable="false"
            class="sort-select"
          />
          <t-button size="medium" variant="outline" @click="toggleSortOrder">
            {{ sortOrderLabel }}
          </t-button>
        </div>
        <div class="page-stats">
          <span class="stat-item">
            <t-icon name="video"/>
            已加载 {{ items.length }} 部作品
          </span>
          <span v-if="total > 0" class="stat-item">
            <t-icon name="list"/>
            总计 {{ total }} 部
          </span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 初始加载状态 -->
      <div v-if="loading && items.length === 0" class="loading-container">
        <t-loading text="正在加载影视数据..."/>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error && items.length === 0" class="error-container">
        <t-icon name="error-circle" class="error-icon"/>
        <p class="error-message">{{ error }}</p>
        <t-button theme="primary" @click="loadData">重新加载</t-button>
      </div>

      <!-- 影视网格 -->
      <div v-else class="media-content">
        <div class="media-grid" >
          <MediaCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            @click="goToDetail"
          />
        </div>

        <!-- 加载更多提示 -->
        <div v-if="loadingMore" class="loading-more">
          <t-loading text="正在加载更多..." size="small"/>
        </div>

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
  </div>
</template>

<script lang="ts" setup>
import {useMediaServerStore} from '@/store';
import type {MediaItem} from '@/modules/media/types/media/MediaItem.ts';
import MessageUtil from "@/util/model/MessageUtil.ts"
import MediaCard from '@/components/media/MediaCard.vue';
import {MediaPageSortOptions, type MediaPageSortBy} from '@/modules/media/types/common/MediaPage.ts';
import {LocalName} from "@/global/LocalName.ts";

const route = useRoute();
const router = useRouter();

const clientId = route.params.id as string;

// 无限滚动状态
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const hasMore = ref(true);

const sortOptions = MediaPageSortOptions;
const sortBy = useLocalStorage<MediaPageSortBy>(`${LocalName.PAGE_MEDIA_HOME_SORT_BY}/${clientId}`, 'SortName');
const sortOrder = useLocalStorage<'Ascending' | 'Descending'>(`${LocalName.PAGE_MEDIA_HOME_SORT_ORDER}/${clientId}`, 'Ascending');
const sortOrderLabel = computed(() => (sortOrder.value === 'Ascending' ? '升序' : '降序'));

// 数据状态
const items = ref<MediaItem[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref<string>('');
const loadMoreError = ref<string>('');

// 滚动节流控制
let isLoading = false;
let pendingReload = false;

// 加载数据（初始加载或重置）
const loadData = async () => {
  if (isLoading) return;

  loading.value = true;
  error.value = '';
  isLoading = true;

  try {
    const client = await useMediaServerStore().getServerClient(clientId);
    const res = await client.getItems({
      page: 1, // 重置为第一页
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    });

    console.log('Initial load response:', res);

    items.value = res.items;
    total.value = res.total;
    hasMore.value = res.hasNext;
    page.value = 1; // 重置页码

    console.log('Initial load completed, hasMore:', hasMore.value);

    // 滚动到顶部
    window.scrollTo({top: 0, behavior: 'smooth'});
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败';
    MessageUtil.error('加载影视数据失败');
  } finally {
    loading.value = false;
    isLoading = false;

    if (pendingReload) {
      pendingReload = false;
      queueMicrotask(loadData);
    }
  }
};

// 加载更多数据
const loadMoreData = async () => {
  if (isLoading || !hasMore.value || loadingMore.value) {
    console.log('Load more blocked:', {isLoading, hasMore: hasMore.value, loadingMore: loadingMore.value});
    return;
  }

  console.log('Starting load more...');
  loadingMore.value = true;
  loadMoreError.value = '';
  isLoading = true;

  try {
    const nextPage = page.value + 1;
    console.log('Loading page:', nextPage);

    const client = await useMediaServerStore().getServerClient(clientId);
    const res = await client.getItems({
      page: nextPage,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    });

    console.log('Load more response:', res);

    // 追加新数据到现有数组
    items.value.push(...res.items);
    total.value = res.total;
    hasMore.value = res.hasNext;
    page.value = nextPage;

    console.log('Load more completed, hasMore:', hasMore.value);

  } catch (err) {
    console.error('Load more error:', err);
    loadMoreError.value = err instanceof Error ? err.message : '加载更多数据失败';
    MessageUtil.error('加载更多数据失败');
  } finally {
    loadingMore.value = false;
    isLoading = false;
  }
};


// 跳转到详情页
const goToDetail = (item: MediaItem) => {
  router.push(`/media/${clientId}/detail/${item.id}`);
};

const mediaWallContainerRef = ref();
useInfiniteScroll(mediaWallContainerRef, loadMoreData, {
  distance: 10
})

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'Ascending' ? 'Descending' : 'Ascending';
};

watch([sortBy, sortOrder], () => {
  if (isLoading) {
    pendingReload = true;
    return;
  }
  loadData();
});

// 监听路由参数变化
watch(() => route.params.id, () => {
  loadData();
}, {immediate: true});

</script>

<script lang="ts">
export default {
  name: "MediaHome"
}
</script>

<style scoped lang="less">
.media-wall-container {
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
  padding: 12px;
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-select {
  width: 180px;
}

.page-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.error-icon {
  font-size: 48px;
  color: var(--td-error-color);
}

.error-message {
  color: var(--td-text-color-secondary);
  font-size: 16px;
  margin: 0;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.media-card {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-large);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
}

.poster-container {
  position: relative;
  width: 100%;
  padding-bottom: 150%; // 2:3 宽高比
  overflow: hidden;
  background: linear-gradient(135deg, var(--td-bg-color-component) 0%, var(--td-bg-color-secondarycomponent) 100%);
}

.poster-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.poster-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--td-brand-color-light) 0%, var(--td-brand-color-light-hover) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;

  &.show-placeholder {
    opacity: 1;
  }
}

.placeholder-icon {
  font-size: 48px;
  color: var(--td-brand-color);
  margin-bottom: 8px;
}

.placeholder-text {
  color: var(--td-brand-color);
  font-size: 14px;
  text-align: center;
  padding: 0 16px;
  word-break: break-word;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  display: flex;
  align-items: flex-end;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
  }
}

.overlay-content {
  width: 100%;
}

.play-btn {
  margin-bottom: 12px;
  background: var(--td-brand-color) !important;
  border-color: var(--td-brand-color) !important;

  &:hover {
    background: var(--td-brand-color-hover) !important;
    border-color: var(--td-brand-color-hover) !important;
  }
}

.item-info {
  color: white;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-year {
  font-size: 14px;
  opacity: 0.8;
  margin: 0 0 8px 0;
}

.item-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.rating-icon {
  color: #ffd700;
}

.card-footer {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.meta-year,
.meta-duration {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.genre-tag {
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
  padding: 2px 8px;
  border-radius: var(--td-radius-default);
  font-size: 12px;
  font-weight: 500;
}

/* 内容区域样式 */
.content-area {
  padding: 0 24px 24px;
  min-height: calc(100vh - 120px);
}

/* 无限滚动相关样式 */
.media-content {
  min-height: 100vh;
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
  gap: 12px;
}

/* 媒体网格 - 使用CSS Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
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
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .media-wall-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 28px;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .card-footer {
    padding: 12px;
  }

  .card-title {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .pagination-container {
    padding: 24px 0;
  }
}
</style>
