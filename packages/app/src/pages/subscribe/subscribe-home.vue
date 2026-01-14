<template>
  <t-layout class="h-100vh w-full subscribe-layout">
    <t-aside :width="'340px'" class="subscribe-aside">
      <div class="subscribe-aside__header">
        <div class="subscribe-aside__title-row">
          <div class="subscribe-aside__title">
            <div class="subscribe-aside__title-text">
              <div class="subscribe-aside__name">
                <t-button theme="primary" variant="text" shape="square" class="mr-8px"
                          @click="goHome()">
                  <template #icon>
                    <home-icon/>
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
          <t-loading size="small"/>
        </div>

        <div v-if="!feeds.length && !loading" class="feed-empty">
          <div class="feed-empty__title">暂无内容</div>
          <div class="feed-empty__desc">尝试刷新或调整搜索关键词</div>
          <t-button size="small" variant="outline" :loading="refreshing" @click="onRefresh()">刷新</t-button>
        </div>
      </div>
    </t-aside>
    <t-content class="overflow-hidden relative">
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
import {HomeIcon} from "tdesign-icons-vue-next";

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
      getSubscribe(subscribeId.value).then(res => subscribe.value = res);
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

const goHome = () => router.push('/home')

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
@import "subscribe-home.less";
</style>
