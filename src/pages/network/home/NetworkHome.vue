<template>
  <div class="network-home-container h-full overflow-auto" ref="containerRef">
    <!-- 粘性页面头部 -->
    <div class="sticky-header">
      <div class="page-header">
        <div class="page-title">{{ client?.props.name }}</div>
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
      <!-- 分类菜单 -->
      <div class="category-section">
        <t-menu v-model="categoryId" class="category-menu">
          <t-menu-item value="" :disabled="loading">首页</t-menu-item>
          <template v-for="cate in categories" :key="cate.id">
            <t-submenu v-if="cate.children && cate.children.length > 0" :value="cate.id" :title="cate.name">
              <t-menu-item v-for="child in cate.children" :key="child.id" :value="child.name" :disabled="loading">
                {{ child.name }}
              </t-menu-item>
            </t-submenu>
            <t-menu-item v-else :value="cate.id" :disabled="loading">{{ cate.name }}</t-menu-item>
          </template>
        </t-menu>
      </div>

      <!-- 初始加载状态 -->
      <t-loading v-if="loading && items.length === 0" text="正在加载视频数据..." class="w-full !pr-232px"/>

      <!-- 错误状态 -->
      <div v-else-if="error && items.length === 0" class="error-container">
        <t-icon name="error-circle" class="error-icon"/>
        <p class="error-message">{{ error }}</p>
        <t-button theme="primary" @click="loadData">重新加载</t-button>
      </div>

      <!-- 视频网格 -->
      <div v-else class="video-content">
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
    <t-back-top container=".network-home-container"/>
  </div>
</template>

<script setup lang="ts">
import {useNetworkServerStore} from '@/store';
import type {NetworkCategory} from '@/modules/network/types/NetworkCategory';
import type {INetworkServer} from '@/modules/network/INetworkServer';
import type {NetworkListItem} from '@/modules/network/types/NetworkListItem';
import MessageUtil from "@/util/model/MessageUtil.ts";

const route = useRoute();

// 网络服务ID
const networkId = route.params.id as string;

// 无限滚动状态
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const hasMore = ref(true);

// 数据状态
const items = ref<NetworkListItem[]>([]);
const categories = ref<NetworkCategory[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref<string>('');
const loadMoreError = ref<string>('');

// 分类状态
const categoryId = ref('');

// DOM引用
const containerRef = ref<HTMLElement>();
// 网络服务客户端
const client = ref<INetworkServer>();

// 滚动节流控制
let isLoading = false;

// 加载数据（初始加载或重置）
const loadData = async () => {
  if (isLoading) return;

  loading.value = true;
  error.value = '';
  isLoading = true;

  try {
    client.value = await useNetworkServerStore().getServerClient(networkId);

    // 加载首页推荐
    client.value.home(1).then(res1 => {
      categories.value = res1.categories;
      console.log('首页推荐:', res1);
    });

    // 加载分类视频
    const res = await client.value.getVideos(categoryId.value, 1);

    items.value = res.data;
    total.value = res.total;
    hasMore.value = res.data.length >= pageSize.value;
    page.value = 1;


    // 滚动到顶部
    if (containerRef.value) {
      containerRef.value.scrollTo({top: 0, behavior: 'smooth'});
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败';
    MessageUtil.error('加载视频数据失败');
  } finally {
    loading.value = false;
    isLoading = false;
  }
};

// 加载更多数据
const loadMoreData = async () => {
  if (isLoading || !hasMore.value || loadingMore.value) {
    console.log('加载更多被阻止:', {isLoading, hasMore: hasMore.value, loadingMore: loadingMore.value});
    return;
  }

  console.log('开始加载更多...');
  loadingMore.value = true;
  loadMoreError.value = '';
  isLoading = true;

  try {
    const nextPage = page.value + 1;
    console.log('加载第几页:', nextPage);

    if (!client.value) {
      client.value = await useNetworkServerStore().getServerClient(networkId);
    }

    // 加载更多分类视频
    const res = await client.value.getVideos(categoryId.value, nextPage);

    // 追加新数据到现有数组
    items.value.push(...res.data);
    total.value = res.total;
    hasMore.value = res.data.length >= pageSize.value;
    page.value = nextPage;

    console.log('加载更多完成, hasMore:', hasMore.value);

  } catch (err) {
    console.error('加载更多错误:', err);
    loadMoreError.value = err instanceof Error ? err.message : '加载更多数据失败';
    MessageUtil.error('加载更多数据失败');
  } finally {
    loadingMore.value = false;
    isLoading = false;
  }
};

// 监听分类变化
watch(categoryId, () => {
  // 重置状态
  page.value = 1;
  total.value = 0;
  hasMore.value = true;
  items.value = [];

  // 重新加载数据
  loadData();
});

// 无限滚动
useInfiniteScroll(containerRef, loadMoreData, {
  distance: 10
});

// 监听路由参数变化
onMounted(() => {
  // 重置所有状态
  categoryId.value = '';
  page.value = 1;
  total.value = 0;
  hasMore.value = true;
  items.value = [];
  categories.value = [];

  // 重新加载数据
  loadData();
})
</script>

<script lang="ts">
export default {
  name: "NetworkHome"
}
</script>

<style scoped lang="less">
.network-home-container {
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
  margin: 0 auto;
}

.page-title {
  font-weight: 700;
  background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-hover) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
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

/* 内容区域布局 */
.content-area {
  display: flex;
  padding: 0 24px;
  min-height: calc(100vh - 129px);
  gap: 24px;
}

/* 分类菜单区域 */
.category-section {
  flex-shrink: 0;
  width: 240px;
  height: calc(100vh - 116px);
  position: sticky;
  top: 72px;
}

.category-menu {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-large);
  border: 1px solid var(--td-border-level-1-color);
}

/* 视频内容区域 */
.video-content {
  flex: 1;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
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

// 响应式设计
@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

}

@media (max-width: 768px) {
  .network-home-container {
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

  .content-area {
    flex-direction: column;
    padding: 0;
    gap: 16px;
  }

  .category-section {
    width: 100%;
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
