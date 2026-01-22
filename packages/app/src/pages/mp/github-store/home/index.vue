<template>
  <app-tool-layout title="Github Store">
    <t-tabs v-model="activeTab" @change="handleTabChange">
      <t-tab-panel label="热门" value="popular" />
      <t-tab-panel label="最新" value="latest" />
      <t-tab-panel label="最近更新" value="new" />
    </t-tabs>

    <div class="repo-list" @scroll="onScroll">
      <div
        v-for="repo in displayRepos"
        :key="repo.id"
        class="repo-item"
        @click="openRepo(repo)"
      >
        <div class="repo-item__header">
          <div class="repo-item__name">{{ repo.full_name }}</div>
          <div class="repo-item__stars">⭐ {{ repo.stargazers_count }}</div>
        </div>
        <div class="repo-item__desc">{{ repo.description || '暂无描述' }}</div>
        <div class="repo-item__meta">
          <span class="repo-item__language">{{ repo.language || 'N/A' }}</span>
          <span class="repo-item__updated">{{ formatDate(repo.updated_at) }}</span>
        </div>
      </div>

      <div v-if="loading" class="repo-loading">
        <t-loading size="small"/>
      </div>

      <div v-if="!displayRepos.length && !loading" class="repo-empty">
        <div class="repo-empty__title">暂无仓库</div>
        <div class="repo-empty__desc">尝试切换其他标签页</div>
      </div>
    </div>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import type {RepoItem} from "@/api/github/searchRepositories.ts";
import {searchRepositories} from "@/api/github/searchRepositories.ts";
import {reposReleaseLatest} from "@/api/github/repos/releases/latest.ts";

const activeTab = ref('popular');
const displayRepos = ref<RepoItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const searchPage = ref(1);
const hasMore = ref(true);

const BATCH_SIZE = 10;
const PER_PAGE = 30;

function getSearchParams() {
  const sortMap: Record<string, 'stars' | 'updated' | 'forks'> = {
    'popular': 'stars',
    'latest': 'forks',
    'new': 'updated'
  };
  return {
    q: '',
    sort: sortMap[activeTab.value] || 'stars',
    order: 'desc' as const,
    per_page: PER_PAGE,
    page: searchPage.value
  };
}

async function fetchReleases(repos: RepoItem[]): Promise<RepoItem[]> {
  const releasePromises = repos.map(repo =>
    reposReleaseLatest(repo.owner.login, repo.name)
  );
  const releases = await Promise.all(releasePromises);
  
  return repos.filter((_repo, index) => {
    const release = releases[index];
    if (!release) return false;

    return release.assets.some(asset =>
      asset.name !== 'Source Code.zip' && asset.name !== 'source-code.zip'
    );
  });
}

async function loadBatch(): Promise<void> {
  if (!hasMore.value || loading.value) return;
  
  loading.value = true;
  try {
    const validRepos: RepoItem[] = [];
    
    while (validRepos.length < BATCH_SIZE && hasMore.value) {
      const params = getSearchParams();
      const result = await searchRepositories(params);
      
      if (result.items.length === 0) {
        hasMore.value = false;
        break;
      }
      
      const filteredRepos = await fetchReleases(result.items);
      validRepos.push(...filteredRepos);
      
      if (result.items.length < PER_PAGE) {
        hasMore.value = false;
      } else {
        searchPage.value++;
      }
    }
    
    if (validRepos.length > 0) {
      displayRepos.value.push(...validRepos.slice(0, BATCH_SIZE));
    }
    
    currentPage.value++;
  } finally {
    loading.value = false;
  }
}

function handleTabChange() {
  displayRepos.value = [];
  currentPage.value = 1;
  searchPage.value = 1;
  hasMore.value = true;
  loadBatch();
}

function onScroll(e: Event) {
  const target = e.target as HTMLElement;
  const {scrollTop, scrollHeight, clientHeight} = target;
  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadBatch();
  }
}

function openRepo(repo: RepoItem) {
  window.open(repo.html_url, '_blank');
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}

onMounted(() => {
  loadBatch();
});
</script>
<style scoped lang="less">
.repo-list {
  height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 16px;
}

.repo-item {
  background: var(--td-bg-color-container);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--td-component-border);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--td-shadow-2);
    border-color: var(--td-brand-color);
  }
}

.repo-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.repo-item__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.repo-item__stars {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.repo-item__desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.repo-item__meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.repo-item__language {
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--td-brand-color);
    margin-right: 4px;
  }
}

.repo-loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.repo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--td-text-color-placeholder);
}

.repo-empty__title {
  font-size: 16px;
  margin-bottom: 8px;
}

.repo-empty__desc {
  font-size: 14px;
}
</style>
