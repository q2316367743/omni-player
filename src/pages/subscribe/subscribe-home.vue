<template>
  <t-layout class="h-100vh w-full subscribe-layout">
    <t-aside :width="'340px'" class="subscribe-aside">
      <div class="subscribe-aside__header">
        <div class="subscribe-aside__title-row">
          <div class="subscribe-aside__title">
            <div class="subscribe-aside__title-text">
              <div class="subscribe-aside__name">
                <t-button v-if="collapsed" theme="primary" size="small" variant="text" shape="square" class="mr-8px"
                          @click="toggleCollapsed()">
                  <template #icon>
                    <menu-icon/>
                  </template>
                </t-button>
                <span>{{ subscribe?.name || 'RSS' }}</span>
              </div>
              <div class="subscribe-aside__sub">
                <span class="subscribe-aside__sub-item">已加载 {{ feeds.length }}/{{ total }}</span>
                <span class="subscribe-aside__sub-dot">·</span>
                <span class="subscribe-aside__sub-item">未读 {{ unreadCount }} 条</span>
              </div>
            </div>
          </div>
          <t-button size="small" variant="outline" :loading="refreshing" @click="onRefresh()">刷新</t-button>
        </div>

        <div class="subscribe-aside__meta">
          <span class="subscribe-aside__meta-label">上次刷新</span>
          <span class="subscribe-aside__meta-value">{{ subscribe ? formatDate(subscribe.updated_at) : '-' }}</span>
        </div>

        <t-input
          v-model="keyword"
          size="small"
          clearable
          placeholder="搜索标题 / 摘要"
          class="subscribe-aside__search"
        />
      </div>

      <div class="subscribe-aside__list" tabindex="0" @scroll="onScroll">
        <div
          v-for="feed in feeds"
          :key="feed.id"
          class="feed-item"
          :class="{active: activeFeedId === feed.id}"
          @click="jumpInfo(feed)"
        >
          <div class="feed-item__main">
            <div class="feed-item__title-row">
              <span v-if="!feed.is_read" class="feed-item__dot"></span>
              <span class="feed-item__title">{{ feed.title || '（无标题）' }}</span>
            </div>
            <div class="feed-item__summary">{{ feed.summary }}</div>
          </div>
          <div class="feed-item__time">{{ formatDate(feed.pub_date, 'MM-DD') }}</div>
        </div>

        <div v-if="loading && page > 1" class="feed-loading">
          <t-loading size="small" />
        </div>

        <div v-if="!feeds.length && !loading" class="feed-empty">
          <div class="feed-empty__title">暂无内容</div>
          <div class="feed-empty__desc">尝试刷新或调整搜索关键词</div>
          <t-button size="small" variant="outline" :loading="refreshing" @click="onRefresh()">刷新</t-button>
        </div>
      </div>
    </t-aside>
    <t-content class="overflow-hidden">
      <router-view/>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {listFeed, refreshFeed} from "@/services/FeedService.ts";
import type {FeedItem, SubscribeItem} from "@/entity/subscribe";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {getSubscribe} from "@/services";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import {MenuIcon} from "tdesign-icons-vue-next";
import {collapsed, toggleCollapsed} from "@/global/Constants.ts";

const route = useRoute();
const router = useRouter();

const subscribe = ref<SubscribeItem>();
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const feeds = ref(new Array<FeedItem>());
const keyword = ref("");
const refreshing = ref(false);
const loading = ref(false);
const hasMore = ref(true);

const subscribeId = computed(() => route.params.subscribeId as string);
const activeFeedId = computed(() => route.params.feedId as string | undefined);
const unreadCount = computed(() => feeds.value.filter(e => !e.is_read).length);

async function run() {
  loading.value = true;
  try {
    const data = await listFeed(subscribeId.value, page.value, pageSize.value, keyword.value);
    if (page.value === 1) {
      console.log(data)
      feeds.value = data.records;
    } else {
      feeds.value.push(...data.records);
    }
    total.value = data.total;
    hasMore.value = feeds.value.length < data.total;
  } finally {
    loading.value = false;
  }
}

function onRefresh() {
  refreshing.value = true;
  refreshFeed(subscribeId.value)
    .then(() => {
      page.value = 1;
      return run();
    })
    .catch(e => {
      MessageUtil.error("刷新失败", e);
    })
    .finally(() => {
      refreshing.value = false;
    });
}

const jumpInfo = (feed: FeedItem) => {
  const target = `/subscribe/${subscribeId.value}/${feed.id}`;
  if (router.currentRoute.value.fullPath !== target) router.push(target);
  feed.is_read = 1;
};

function loadMore() {
  if (loading.value || !hasMore.value) return;
  page.value++;
  run();
}

function onScroll(e: Event) {
  const target = e.target as HTMLElement;
  const {scrollTop, scrollHeight, clientHeight} = target;
  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadMore();
  }
}

watch(keyword, () => {
  page.value = 1;
  run();
});

watch(subscribeId, async () => {
  subscribe.value = await getSubscribe(subscribeId.value);
  page.value = 1;
  pageSize.value = 20;
  total.value = 0;
  feeds.value = [];
  keyword.value = "";
  hasMore.value = true;
  await run();
  const currentFeedId = route.params.feedId as string | undefined;
  if (!currentFeedId) {
    const target = `/subscribe/${subscribeId.value}/0`;
    if (router.currentRoute.value.fullPath !== target) await router.replace(target);
  }
}, {immediate: true});
</script>
<style scoped lang="less">
.subscribe-layout {
  background-color: var(--td-bg-color-container);
}

.subscribe-aside {
  height: 100%;
  border-right: 1px solid var(--td-border-level-1-color);
  background-color: var(--td-bg-color-container);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.subscribe-aside__header {
  padding: 14px 14px 10px;
  border-bottom: 1px solid var(--td-border-level-1-color);
  background-color: var(--td-bg-color-container);
}

.subscribe-aside__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.subscribe-aside__title {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.subscribe-aside__icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  flex: 0 0 auto;
}

.subscribe-aside__title-text {
  overflow: hidden;
}

.subscribe-aside__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subscribe-aside__sub {
  margin-top: 2px;
  font-size: 11px;
  color: var(--td-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.subscribe-aside__sub-dot {
  opacity: 0.7;
}

.subscribe-aside__meta {
  margin-top: 10px;
  font-size: 11px;
  color: var(--td-text-color-secondary);
  display: flex;
  gap: 6px;
}

.subscribe-aside__meta-value {
  color: var(--td-text-color-primary);
  opacity: 0.9;
}

.subscribe-aside__search {
  margin-top: 10px;
}

.subscribe-aside__list {
  flex: 1;
  overflow: auto;
  padding: 10px 10px 12px;
}

.feed-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;
  user-select: none;
}

.feed-item:hover {
  background-color: var(--td-bg-color-container-hover);
}

.feed-item.active {
  background-color: var(--td-bg-color-container-active);
}

.feed-item.read {
  opacity: 0.6;
}

.feed-item.read .feed-item__title {
  font-weight: 400;
}

.feed-item.read .feed-item__summary {
  opacity: 0.7;
}

.feed-item__main {
  min-width: 0;
  flex: 1;
}

.feed-item__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.feed-item__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background-color: var(--td-brand-color);
  flex: 0 0 auto;
}

.feed-item__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-item__summary {
  margin-top: 6px;
  font-size: 12px;
  color: var(--td-text-color-secondary);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 16px;
}

.feed-item__time {
  font-size: 11px;
  color: var(--td-text-color-secondary);
  opacity: 0.9;
  white-space: nowrap;
  padding-top: 1px;
  flex: 0 0 auto;
}

.feed-empty {
  margin: 18px 6px 0;
  padding: 18px 14px;
  border-radius: 12px;
  border: 1px dashed var(--td-border-level-1-color);
  background-color: var(--td-bg-color-component);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.feed-empty__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.feed-empty__desc {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.feed-loading {
  display: flex;
  justify-content: center;
  padding: 12px;
}

</style>
