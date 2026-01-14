<template>
  <MainLayout>
    <template #header>
      <div class="ml-8px">聚合搜索</div>
    </template>
    <template #content>
      <div class="aggregation-container h-full overflow-auto" ref="containerRef">
        <div class="sticky-header">
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
              聚合搜索
            </t-button>
          </div>
        </div>

        <div class="content-area">
          <t-loading v-if="loading && aggregatedItems.length === 0" text="正在搜索..." class="w-full"/>

          <div v-else-if="!hasSearched && aggregatedItems.length === 0" class="empty-container">
            <t-icon name="search" class="empty-icon"/>
            <p class="empty-message">请输入关键字开始聚合搜索</p>
          </div>

          <div v-else-if="hasSearched && aggregatedItems.length === 0 && !loading" class="empty-container">
            <t-icon name="info-circle" class="empty-icon"/>
            <p class="empty-message">未找到相关视频</p>
            <p class="empty-hint">请尝试其他关键字</p>
          </div>

          <div v-else class="video-content">
            <div class="search-info" v-if="hasSearched">
          <span class="info-text">
            <t-icon name="video"/>
            找到 {{ aggregatedItems.length }} 部作品（来自 {{ serverCount }} 个资源）
          </span>
            </div>

            <div class="aggregation-grid">
              <AggregationCard
                v-for="item in aggregatedItems"
                :key="item.title"
                :aggregation-item="item"
              />
            </div>
          </div>
        </div>
        <t-back-top container=".aggregation-container"/>
      </div>
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import {useNetworkServerStore} from '@/store';
import type {NetworkListItem} from '@/modules/network/types/NetworkListItem';
import MessageUtil from "@/util/model/MessageUtil.ts";
import AggregationCard from './components/AggregationCard.vue';

const route = useRoute();

const keyword = ref(route.query.keyword as string || '');
const hasSearched = ref(false);
const loading = ref(false);

interface AggregatedItem {
  title: string;
  items: Array<{
    item: NetworkListItem;
    serverId: string;
    serverName: string;
  }>;
}

const aggregatedItems = ref<AggregatedItem[]>([]);
const serverCount = ref(0);

async function handleSearch() {
  if (!keyword.value.trim()) {
    MessageUtil.warning('请输入搜索关键字');
    return;
  }

  loading.value = true;
  hasSearched.value = true;
  aggregatedItems.value = [];
  serverCount.value = 0;

  try {
    const {servers, getServerClient} = useNetworkServerStore();
    const allResults: Array<{
      item: NetworkListItem;
      serverId: string;
      serverName: string;
    }> = [];

    const searchPromises = servers.map(async (server) => {
      try {
        const client = await getServerClient(server.id);
        const result = await client.searchVideos(keyword.value.trim(), 1);
        const itemsWithServer = result.data.map(item => ({
          item,
          serverId: server.id,
          serverName: server.name
        }));
        return itemsWithServer;
      } catch (err) {
        console.error(`服务器 ${server.name} 搜索失败:`, err);
        return [];
      }
    });

    const results = await Promise.all(searchPromises);
    results.forEach(result => {
      allResults.push(...result);
    });

    serverCount.value = servers.length;

    const titleMap = new Map<string, AggregatedItem>();

    allResults.forEach(({item, serverId, serverName}) => {
      const title = item.title.trim();
      if (!titleMap.has(title)) {
        titleMap.set(title, {
          title,
          items: []
        });
      }
      titleMap.get(title)!.items.push({item, serverId, serverName});
    });

    aggregatedItems.value = Array.from(titleMap.values());

  } catch (err) {
    MessageUtil.error('搜索失败', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (keyword.value) {
    handleSearch();
  }
});
</script>

<style scoped lang="less">
.aggregation-container {
  background: linear-gradient(135deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--td-bg-color-container);
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-section {
  display: flex;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.content-area {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--td-text-color-secondary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-message {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  opacity: 0.7;
}

.video-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--td-bg-color-container);
  border-radius: 8px;
  color: var(--td-text-color-primary);
}

.info-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.aggregation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
</style>
