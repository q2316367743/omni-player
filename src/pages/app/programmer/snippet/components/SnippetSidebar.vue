<template>
  <t-aside class="snippet-aside">
    <div class="aside-header">
      <app-tool-back variant="outline" size="small"/>
      <t-button theme="primary" size="small" class="!ml-auto" @click="handleAddSnippet">
        <template #icon>
          <add-icon />
        </template>
        新增
      </t-button>
      <t-button size="small" variant="text" class="ml-8px" @click="showSearch = !showSearch">
        <template #icon>
          <search-icon />
        </template>
        搜索
      </t-button>
    </div>
    
    <div v-if="showSearch" class="search-bar">
      <t-input
        v-model="keyword"
        placeholder="输入关键词或 #标签 搜索"
        clearable
        @enter="handleSearch"
      >
        <template #suffix-icon>
          <search-icon />
        </template>
      </t-input>
    </div>
    
    <div class="snippet-list" @scroll="handleScroll">
      <div
        v-for="item in snippetList"
        :key="item.id"
        :class="['snippet-item', { active: currentSnippetId === item.id }]"
        @click="handleSelectSnippet(item)"
        @contextmenu="handleContextMenu(item, $event)"
      >
        <div class="snippet-name">{{ item.name }}</div>
        <div class="snippet-meta">
          <span class="snippet-time">{{ formatTime(item.updated_at) }}</span>
          <div v-if="item.tags.length > 0" class="snippet-tags">
            <t-tag
              v-for="tag in item.tags"
              :key="tag.id"
              size="small"
              variant="light"
              theme="default"
            >
              #{{ tag.name }}
            </t-tag>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading-more">
        <t-loading size="small" />
        <span>加载中...</span>
      </div>
      
      <div v-if="!hasMore && snippetList.length > 0" class="no-more">
        没有更多了
      </div>
      
      <div v-if="snippetList.length === 0 && !loading" class="empty">
        <t-empty description="暂无代码片段" />
      </div>
    </div>
  </t-aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { pageSnippet } from '@/services/SnippetService';
import type { SnippetMetaWithTag } from '@/services/SnippetService';
import MessageUtil from '@/util/model/MessageUtil';
import dayjs from 'dayjs';
import { openSnippetEdit, openSnippetContextmenu } from '../func/SnippetEdit';

defineProps<{
  currentSnippetId?: string;
}>();

const emit = defineEmits<{
  select: [snippet: SnippetMetaWithTag]
}>();

const showSearch = ref(false);
const keyword = ref('');
const snippetList = ref<SnippetMetaWithTag[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = 20;

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
};

const loadSnippets = async (reset = false) => {
  if (loading.value) return;
  
  if (reset) {
    currentPage.value = 1;
    snippetList.value = [];
    hasMore.value = true;
  }
  
  loading.value = true;
  try {
    const result = await pageSnippet(
      keyword.value,
      currentPage.value,
      pageSize
    );
    
    if (reset) {
      snippetList.value = result.records;
    } else {
      snippetList.value = [...snippetList.value, ...result.records];
    }
    
    hasMore.value = snippetList.value.length < result.total;
  } catch {
    MessageUtil.error('加载代码片段失败');
  } finally {
    loading.value = false;
  }
};

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = target;
  
  if (scrollHeight - scrollTop - clientHeight < 50 && hasMore.value && !loading.value) {
    currentPage.value++;
    loadSnippets();
  }
};

const handleSearch = () => {
  loadSnippets(true);
};

const handleSelectSnippet = (item: SnippetMetaWithTag) => {
  emit('select', item);
};

const handleAddSnippet = () => {
  openSnippetEdit(undefined, refresh);
};

const handleContextMenu = (item: SnippetMetaWithTag, e: PointerEvent) => {
  openSnippetContextmenu(item, e, refresh);
};

const refresh = () => {
  loadSnippets(true);
};

defineExpose({
  refresh
});

onMounted(() => {
  loadSnippets();
});
</script>

<style scoped lang="less">
.snippet-aside {
  width: 300px;
  background: var(--fluent-sidebar-bg);
  border-right: 1px solid var(--fluent-sidebar-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.aside-header {
  padding: 8px;
  width: calc(100% - 16px);
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--fluent-border-subtle);
}

.search-bar {
  padding: 12px;
  border-bottom: 1px solid var(--fluent-border-subtle);
}

.snippet-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--td-scrollbar-color);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--td-scrollbar-hover-color);
  }
}

.snippet-item {
  padding: 12px;
  margin-bottom: 8px;
  background: var(--fluent-card-bg);
  border: 1px solid var(--fluent-card-border);
  border-radius: var(--fluent-radius-card);
  cursor: pointer;
  transition: all var(--fluent-transition-fast);
  
  &:hover {
    background: var(--fluent-card-bg-hover);
    box-shadow: var(--fluent-card-shadow-hover);
  }
  
  &.active {
    border-color: var(--fluent-item-selected-border);
    background: var(--fluent-item-selected);
  }
}

.snippet-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snippet-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.snippet-time {
  flex-shrink: 0;
}

.snippet-tags {
  display: flex;
  gap: 4px;
  margin-left: 8px;
  overflow: hidden;
  
  :deep(.t-tag) {
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.loading-more,
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  gap: 8px;
}

.empty {
  padding: 40px 20px;
}
</style>
