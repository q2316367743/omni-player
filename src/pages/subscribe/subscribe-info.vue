<template>
  <div :class="['subscribe-info', { 'is-fullscreen': isFullscreen }]">
    <div class="subscribe-info__header">
      <div class="subscribe-info__header-inner">
        <div class="subscribe-info__header-top">
          <div class="subscribe-info__title">
            <t-button theme="primary" shape="square" variant="text" @click="toggleFullscreen()">
              <template #icon>
                <view-list-icon v-if="isFullscreen"/>
                <menu-fold-icon v-else/>
              </template>
            </t-button>
            <span class="ml-8px">{{ displayTitle }}</span>
          </div>
          <div class="subscribe-info__actions">
            <t-radio-group v-model="viewMode" variant="default-filled">
              <t-radio-button value="read">阅读视图</t-radio-button>
              <t-radio-button value="web" :disabled="!content?.link">网页视图</t-radio-button>
            </t-radio-group>
            <t-tooltip content="在外部打开" placement="bottom-right">
              <t-button
                variant="text"
                theme="primary"
                shape="square"
                :disabled="!content?.link"
                @click.stop="openOriginal()"
              >
                <template #icon>
                  <share-icon/>
                </template>
              </t-button>
            </t-tooltip>
          </div>
        </div>
        <div class="subscribe-info__meta">
          <span v-if="content?.author" class="subscribe-info__meta-item">{{ content.author }}</span>
          <span v-if="content?.pub_date" class="subscribe-info__meta-item">{{ formatDate(content.pub_date) }}</span>
          <span v-if="content?.parse_success === 0" class="subscribe-info__badge">解析可能不完整</span>
        </div>
      </div>
    </div>

    <div class="subscribe-info__wrap" ref="scrollRef" @click="onContentClick">
      <custome-webview v-if="viewMode === 'web' && content?.link" :url="content.link"/>
      <t-loading v-else :loading="loading" class="subscribe-info__scroll">
        <div class="subscribe-info__scroll-inner">

          <div v-if="isNoneSelected" class="subscribe-info__center">
            <empty-result title="未选择内容" tip="从左侧选择一条文章查看详情"/>
          </div>

          <div v-else-if="errorTip" class="subscribe-info__center">
            <empty-result title="加载失败" :tip="errorTip">
              <t-button variant="outline" @click="reload()">重试</t-button>
            </empty-result>
          </div>

          <div v-else-if="viewMode === 'read'" class="subscribe-info__paper">
            <article class="rss-article" v-html="contentHtml"></article>
          </div>
        </div>
      </t-loading>
      <t-back-top container=".subscribe-info__scroll"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {type FeedWrapper, getFeedContent} from "@/services/FeedService.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import EmptyResult from "@/components/Result/EmptyResult.vue";
import {openUrl} from "@tauri-apps/plugin-opener";
import {previewImages} from "@/pages/subscribe/func/previewImages.tsx";
import {MenuFoldIcon, ShareIcon, ViewListIcon} from "tdesign-icons-vue-next";
import {LocalName} from "@/global/LocalName.ts";

const route = useRoute();

const content = ref<FeedWrapper>();
const loading = ref(false);
const errorTip = ref("");
const scrollRef = ref<HTMLElement | null>(null);
const viewMode = useLocalStorage<"read" | "web">(LocalName.PAGE_SUBSCRIBE_VIEW_MODE(route.params.subscribeId as string), "read");
const isFullscreen = ref(false);

const feedId = computed(() => route.params.feedId as string);
const isNoneSelected = computed(() => feedId.value === "0");
const displayTitle = computed(() => content.value?.parsed_title || content.value?.title || "");
const contentHtml = computed(() => content.value?.parsed_content || "");

function scrollToTop() {
  if (!scrollRef.value) return;
  scrollRef.value.scrollTop = 0;
}


watch(feedId, async val => {
  await load(val);
}, {immediate: true});


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

</script>
<style scoped lang="less">
@import "./subscribe-info.less";
</style>
