<template>
  <div class="media-wall-container h-full overflow-auto" ref="mediaWallContainerRef">
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

    <div class="content-area">
      <div v-if="loading && items.length === 0" class="loading-container">
        <t-loading text="正在加载影视数据..."/>
      </div>

      <div v-else-if="error && items.length === 0" class="error-container">
        <t-icon name="error-circle" class="error-icon"/>
        <p class="error-message">{{ error }}</p>
        <t-button theme="primary" @click="loadData">重新加载</t-button>
      </div>

      <div v-else class="media-content">
        <div class="media-grid">
          <MediaCard v-for="item in items" :key="item.id" :item="item" @click="goToDetail"/>
        </div>

        <div v-if="loadingMore" class="loading-more">
          <t-loading text="正在加载更多..." size="small"/>
        </div>

        <div v-if="!hasMore && items.length > 0" class="load-complete">
          <t-icon name="check-circle" class="complete-icon"/>
          <span>已加载全部 {{ total }} 部作品</span>
        </div>

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
import type {PaginationOptions} from '@/modules/media/types/common/MediaPage.ts';
import {type MediaPageSortBy, MediaPageSortOptions} from '@/modules/media/types/common/MediaPage.ts';
import MessageUtil from '@/util/model/MessageUtil.ts';
import MediaCard from '@/pages/media/components/MediaCard.vue';

const props = defineProps<{
  clientId: string;
  sortByStorageKey: string;
  sortOrderStorageKey: string;
  options: Partial<PaginationOptions>
}>();

const router = useRouter();

const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const hasMore = ref(true);

const sortOptions = MediaPageSortOptions;
const sortBy = useLocalStorage<MediaPageSortBy>(props.sortByStorageKey, 'SortName');
const sortOrder = useLocalStorage<'Ascending' | 'Descending'>(props.sortOrderStorageKey, 'Ascending');
const sortOrderLabel = computed(() => (sortOrder.value === 'Ascending' ? '升序' : '降序'));

const items = ref<MediaItem[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref<string>('');
const loadMoreError = ref<string>('');

const mediaWallContainerRef = ref<HTMLElement>();

let isLoading = false;
let pendingReload = false;

const scrollToTop = () => {
  if (mediaWallContainerRef.value) {
    mediaWallContainerRef.value.scrollTo({top: 0, behavior: 'smooth'});
    return;
  }
  window.scrollTo({top: 0, behavior: 'smooth'});
};

const loadData = async () => {
  if (isLoading) return;

  loading.value = true;
  error.value = '';
  isLoading = true;

  try {
    const client = await useMediaServerStore().getServerClient(props.clientId);
    const res = await client.getItems({
      page: 1,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      ...props.options,
    });

    items.value = res.items;
    total.value = res.total;
    hasMore.value = res.hasNext;
    page.value = 1;

    scrollToTop();
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

const loadMoreData = async () => {
  if (isLoading || !hasMore.value || loadingMore.value) return;

  loadingMore.value = true;
  loadMoreError.value = '';
  isLoading = true;

  try {
    const nextPage = page.value + 1;
    const client = await useMediaServerStore().getServerClient(props.clientId);
    const res = await client.getItems({
      page: nextPage,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      ...props.options
    });

    items.value.push(...res.items);
    total.value = res.total;
    hasMore.value = res.hasNext;
    page.value = nextPage;
  } catch (err) {
    loadMoreError.value = err instanceof Error ? err.message : '加载更多数据失败';
    MessageUtil.error('加载更多数据失败');
  } finally {
    loadingMore.value = false;
    isLoading = false;
  }
};

const goToDetail = (item: MediaItem) => {
  router.push(`/media/${props.clientId}/detail/${item.id}`);
};

useInfiniteScroll(mediaWallContainerRef, loadMoreData, {
  distance: 10,
});

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

watch(
  () => props.clientId,
  () => {
    items.value = [];
    total.value = 0;
    hasMore.value = true;
    page.value = 1;
    loadData();
  },
  {immediate: true},
);
</script>

<style scoped lang="less">
.media-wall-container {
  background: linear-gradient(135deg,
  var(--td-bg-color-container) 0%,
  var(--td-bg-color-secondarycontainer) 100%);
  padding: 0;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg,
  var(--td-bg-color-container) 0%,
  var(--td-bg-color-secondarycontainer) 100%);
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

.content-area {
  padding: 0 24px 24px;
  min-height: calc(100vh - 120px);
}

.media-content {
  min-height: 100vh;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
  gap: 12px;
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

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
}
</style>

