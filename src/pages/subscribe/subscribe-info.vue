<template>
  <t-loading :loading="loading" :class="['subscribe-info', { 'is-fullscreen': isFullscreen }]">
    <div v-if="isNoneSelected" class="subscribe-info__center">
      <empty-result title="未选择内容" tip="从左侧选择一条文章查看详情"/>
    </div>

    <div v-else-if="errorTip" class="subscribe-info__center">
      <empty-result title="加载失败" :tip="errorTip">
        <t-button variant="outline" @click="reload()">重试</t-button>
      </empty-result>
    </div>

    <div v-else class="subscribe-info__wrap" @click="onContentClick">
      <div class="subscribe-info__header">
        <div class="subscribe-info__header-inner">
          <div class="subscribe-info__header-top">
            <div class="subscribe-info__title">{{ displayTitle }}</div>
            <div class="subscribe-info__actions">
              <t-radio-group v-model="viewMode" size="small" variant="default-filled">
                <t-radio-button value="read">阅读视图</t-radio-button>
                <t-radio-button value="web" :disabled="!content?.link">网页视图</t-radio-button>
              </t-radio-group>
              <t-tooltip content="在外部打开">
                <t-button
                  size="small"
                  variant="text"
                  theme="primary"
                  shape="square"
                  :disabled="!content?.link"
                  @click.stop="openOriginal()"
                >
                  <template #icon>
                    <t-icon name="link"/>
                  </template>
                </t-button>
              </t-tooltip>
              <t-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
                <t-button
                  size="small"
                  variant="text"
                  theme="primary"
                  shape="square"
                  @click.stop="toggleFullscreen()"
                >
                  <template #icon>
                    <t-icon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"/>
                  </template>
                </t-button>
              </t-tooltip>
            </div>
          </div>
          <div class="subscribe-info__meta">
            <span v-if="content?.author" class="subscribe-info__meta-item">{{ content.author }}</span>
            <span v-if="content?.pub_date" class="subscribe-info__meta-item">{{ formatDate(content.pub_date) }}</span>
            <span v-if="content?.parse_success === false" class="subscribe-info__badge">解析可能不完整</span>
          </div>
        </div>
      </div>

      <div ref="scrollRef" class="subscribe-info__scroll">
        <div v-if="viewMode === 'read'" class="subscribe-info__paper">
          <article class="rss-article" v-html="contentHtml"></article>
        </div>
        <iframe
          v-else-if="viewMode === 'web' && content?.link"
          :src="content.link"
          class="subscribe-info__iframe"
          frameborder="0"
          allowfullscreen
        />
      </div>

      <t-back-top container=".subscribe-info__scroll"/>
    </div>
  </t-loading>
</template>
<script lang="ts" setup>
import {type FeedWrapper, getFeedContent} from "@/services/FeedService.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import EmptyResult from "@/components/Result/EmptyResult.vue";
import {openUrl} from "@tauri-apps/plugin-opener";
import {previewImages} from "@/pages/subscribe/func/previewImages.tsx";

const route = useRoute();

const content = ref<FeedWrapper>();
const loading = ref(false);
const errorTip = ref("");
const scrollRef = ref<HTMLElement | null>(null);
const viewMode = ref<"read" | "web">("read");
const isFullscreen = ref(false);

const feedId = computed(() => route.params.feedId as string);
const isNoneSelected = computed(() => feedId.value === "0");
const displayTitle = computed(() => content.value?.parsed_title || content.value?.title || "");
const contentHtml = computed(() => content.value?.parsed_content || "");

function scrollToTop() {
  if (!scrollRef.value) return;
  scrollRef.value.scrollTop = 0;
}

async function load(feedIdValue: string) {
  if (!feedIdValue || feedIdValue === "0") {
    loading.value = false;
    errorTip.value = "";
    content.value = undefined;
    await nextTick();
    scrollToTop();
    return;
  }

  try {
    scrollToTop();
    loading.value = true;
    errorTip.value = "";
    content.value = await getFeedContent(feedIdValue);
    await nextTick();
    scrollToTop();
  } catch (e) {
    errorTip.value = "内容获取失败，请稍后重试";
    MessageUtil.error("加载失败", e);
    await nextTick();
    scrollToTop();
  } finally {
    loading.value = false;
  }
}

function reload() {
  void load(feedId.value);
}

async function openOriginal() {
  const url = content.value?.link;
  if (!url) return;
  try {
    await openUrl(url);
  } catch (e) {
    MessageUtil.error("打开原文失败", e);
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

function onContentClick(e: MouseEvent) {
  if (viewMode.value === "web") return;
  
  const target = e.target as HTMLElement | null;
  const img = target?.closest?.("img") as HTMLImageElement | null;
  if (img && img.closest(".rss-article")) {
    const src = img.getAttribute("src") || "";
    const article = scrollRef.value?.querySelector(".rss-article");
    const images = Array.from(article?.querySelectorAll("img") || [])
      .map((node) => node.getAttribute("src") || "")
      .filter(Boolean);
    const index = src ? images.indexOf(src) : 0;
    e.preventDefault();
    previewImages(images, index >= 0 ? index : 0);
    return;
  }

  const a = target?.closest?.("a") as HTMLAnchorElement | null;
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  e.preventDefault();
  void openUrl(href);
}

watch(feedId, async val => {
  await load(val);
}, {immediate: true});
</script>
<style scoped lang="less">
.subscribe-info {
  height: 100%;
  background-color: var(--td-bg-color-container);
  overflow: hidden;
}

.subscribe-info.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //z-index: 9999;
}

.subscribe-info__wrap {
  position: relative;
  height: 100%;
}

.subscribe-info__center {
  height: 100%;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subscribe-info__scroll {
  --subscribe-info-header-height: 74px;
  position: absolute;
  top: var(--subscribe-info-header-height);
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px 18px 48px;
  box-sizing: border-box;
}

.subscribe-info__header {
  --subscribe-info-header-height: 74px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  height: var(--subscribe-info-header-height);
  border-bottom: 1px solid var(--td-border-level-1-color);
  background-color: var(--td-bg-color-container);
  box-sizing: border-box;
}

.subscribe-info__header-inner {
  height: 100%;
  max-width: 920px;
  margin: 0 auto;
  padding: 10px 18px 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.subscribe-info__header-top {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.subscribe-info__title {
  font-size: 18px;
  font-weight: 650;
  color: var(--td-text-color-primary);
  line-height: 24px;
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subscribe-info__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  font-size: 11px;
  color: var(--td-text-color-secondary);
}

.subscribe-info__meta-item {
  white-space: nowrap;
}

.subscribe-info__badge {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--td-border-level-1-color);
  background-color: var(--td-bg-color-container);
  color: var(--td-text-color-secondary);
  font-size: 11px;
  line-height: 16px;
}

.subscribe-info__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 0 0 auto;
}

.subscribe-info__paper {
  max-width: 920px;
  margin: 14px auto 0;
  padding: 18px 18px 22px;
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 14px;
  background-color: var(--td-bg-color-container);
  overflow-x: hidden;
}

.subscribe-info__iframe {
  width: 100%;
  height: 100%;
  border: none;
}

:deep(.rss-article) {
  color: var(--td-text-color-primary);
  font-size: 14px;
  line-height: 1.9;
  word-break: break-word;
  overflow-wrap: anywhere;
}

:deep(.rss-article a) {
  color: var(--td-brand-color);
  text-decoration: none;
  border-bottom: 1px solid var(--td-brand-color);
  padding-bottom: 1px;
}

:deep(.rss-article a:hover) {
  color: var(--td-brand-color-hover);
  border-bottom-color: var(--td-brand-color-hover);
}

:deep(.rss-article p) {
  margin: 10px 0;
  color: var(--td-text-color-primary);
}

:deep(.rss-article h1),
:deep(.rss-article h2),
:deep(.rss-article h3),
:deep(.rss-article h4) {
  margin: 18px 0 10px;
  color: var(--td-text-color-primary);
  line-height: 1.35;
}

:deep(.rss-article h1) {
  font-size: 20px;
  font-weight: 700;
}

:deep(.rss-article h2) {
  font-size: 18px;
  font-weight: 680;
}

:deep(.rss-article h3) {
  font-size: 16px;
  font-weight: 650;
}

:deep(.rss-article ul),
:deep(.rss-article ol) {
  margin: 10px 0;
  padding-left: 20px;
  color: var(--td-text-color-primary);
}

:deep(.rss-article li) {
  margin: 6px 0;
}

:deep(.rss-article blockquote) {
  margin: 12px 0;
  padding: 10px 12px;
  border-left: 3px solid var(--td-brand-color);
  background-color: var(--td-bg-color-component);
  color: var(--td-text-color-secondary);
}

:deep(.rss-article pre) {
  margin: 12px 0;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--td-border-level-1-color);
  background-color: var(--td-bg-color-component);
  overflow: auto;
  max-width: 100%;
}

:deep(.rss-article code) {
  padding: 0 6px;
  border-radius: 6px;
  border: 1px solid var(--td-border-level-1-color);
  background-color: var(--td-bg-color-component);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
}

:deep(.rss-article pre code) {
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 12px;
}

:deep(.rss-article hr) {
  margin: 16px 0;
  border: 0;
  border-top: 1px solid var(--td-border-level-1-color);
}

:deep(.rss-article img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 12px auto;
  border-radius: 12px;
  border: 1px solid var(--td-border-level-1-color);
  cursor: zoom-in;
}

:deep(.rss-article table) {
  display: block;
  max-width: 100%;
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  overflow: auto;
}

:deep(.rss-article th),
:deep(.rss-article td) {
  border: 1px solid var(--td-border-level-1-color);
  padding: 8px 10px;
  word-break: break-word;
}

:deep(.rss-article th) {
  background-color: var(--td-bg-color-component);
  color: var(--td-text-color-primary);
  font-weight: 650;
}

</style>
