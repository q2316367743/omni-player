<template>
  <div class="h-full w-full overflow-auto">
    <div
      class="min-h-full w-full bg-gradient-to-br from-slate-50 via-fuchsia-50 to-cyan-50 text-slate-900 dark:from-slate-950 dark:via-fuchsia-950 dark:to-cyan-950 dark:text-slate-50"
    >
      <div v-if="loading" class="min-h-[60vh] w-full flex items-center justify-center">
        <t-loading size="large" text="加载中..."/>
      </div>

      <div v-else-if="error" class="min-h-[60vh] w-full flex items-center justify-center px-4">
        <div
          class="max-w-xl rounded-2xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/30"
        >
          <div class="text-xl font-semibold">加载失败</div>
          <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ error }}</div>
          <div class="mt-5 flex gap-3">
            <t-button theme="primary" @click="loadDetail">重试</t-button>
            <t-button theme="default" variant="outline" @click="router.back()">返回</t-button>
          </div>
        </div>
      </div>

      <div v-else-if="detail" class="relative">
        <div class="absolute inset-0 overflow-hidden">
          <img
            v-if="detail.cover"
            :src="detail.cover"
            :alt="detail.title"
            class="h-full w-full object-cover opacity-20 blur-sm scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>
          <div
            class="abs-24 rounded-full bg-gradient-to-r from-indigo-500/25 via-fuchsia-500/25 to-cyan-500/25 blur-3xl"/>
          <div
            class="absolute right-10 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-500/20 blur-3xl"/>
        </div>

        <div
          class="sticky top-0 z-20 border-b border-white/20 bg-white/55 backdrop-blur dark:border-white/10 dark:bg-black/25"
        >
          <div class="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center gap-3">
            <t-button theme="default" variant="outline" shape="circle" @click="router.back()">
              <template #icon>
                <chevron-left-icon/>
              </template>
            </t-button>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm text-slate-600 dark:text-slate-300">
                网络影视详情
              </div>
              <div class="truncate text-lg font-semibold">{{ detail.title || '未命名' }}</div>
            </div>
            <t-button theme="primary" class="shadow-lg" @click="openPlayer">
              <template #icon>
                <play-icon/>
              </template>
              播放
            </t-button>
            <t-button theme="default" variant="outline" @click="loadDetail">
              <template #icon>
                <refresh-icon/>
              </template>
              刷新
            </t-button>
          </div>
        </div>

        <div class="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 py-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div class="lg:col-span-1">
              <div class="sticky top-24">
                <div
                  class="relative overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur dark:border-white/10"
                >
                  <div class="relative aspect-[2/3] w-full overflow-hidden">
                    <img
                      v-if="detail.cover"
                      :src="detail.cover"
                      :alt="detail.title"
                      class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      v-else
                      class="h-full w-full bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/30 to-cyan-500/40 flex items-center justify-center"
                    >
                      <image-icon class="text-5xl text-white/60"/>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent"/>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <t-button theme="primary" shape="circle" size="large" class="shadow-xl" @click="openPlayer">
                        <template #icon>
                          <play-icon/>
                        </template>
                      </t-button>
                    </div>

                    <div class="absolute left-3 top-3 flex gap-2">
                      <t-tag theme="primary" variant="light" shape="round" class="border-0 bg-white/20 text-white">
                        {{ detail.type === 'Movie' ? '电影' : '剧集' }}
                      </t-tag>
                      <t-tag
                        v-if="detail.remark"
                        theme="success"
                        variant="light"
                        shape="round"
                        class="border-0 bg-white/20 text-white"
                      >
                        {{ detail.remark }}
                      </t-tag>
                    </div>

                    <div class="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                      <t-tag
                        v-if="detail.releaseYear"
                        theme="default"
                        variant="light"
                        shape="round"
                      >
                        <template #icon>
                          <calendar-icon/>
                        </template>
                        {{ detail.releaseYear }}
                      </t-tag>
                      <t-tag
                        v-if="detail.region"
                        theme="default"
                        variant="light"
                        shape="round"
                      >
                        <template #icon>
                          <location-icon/>
                        </template>
                        {{ detail.region }}
                      </t-tag>
                      <t-tag
                        v-if="detail.language"
                        theme="default"
                        variant="light"
                        shape="round"
                      >
                        <template #icon>
                          <translate-icon/>
                        </template>
                        {{ detail.language }}
                      </t-tag>
                    </div>
                  </div>

                  <div class="p-4">
                    <div class="text-base font-semibold leading-snug">{{ detail.title || '未命名' }}</div>
                    <div v-if="detail.subtitle" class="mt-1 text-sm text-white/70">{{ detail.subtitle }}</div>
                    <div class="mt-4 grid grid-cols-2 gap-3">
                      <t-button theme="primary" block class="shadow-lg" @click="openPlayer">
                        <template #icon>
                          <play-icon/>
                        </template>
                        播放
                      </t-button>
                      <t-button theme="default" variant="outline" block @click="loadDetail">
                        <template #icon>
                          <refresh-icon/>
                        </template>
                        刷新
                      </t-button>
                    </div>
                  </div>
                </div>

                <div
                  class="mt-5 rounded-2xl border border-white/25 bg-white/10 p-4 shadow-xl backdrop-blur dark:border-white/10"
                >
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-semibold">基础信息</div>
                    <div class="text-xs text-white/70">ID: {{ detail.id }}</div>
                  </div>
                  <div class="mt-3 grid grid-cols-2 gap-3 text-sm text-white/80">
                    <div class="flex items-center gap-2">
                      <time-icon class="text-white/70"/>

                      <span>{{ detail.duration || '未知时长' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <video-icon class="text-white/70"/>
                      <span>{{ detail.total ? `${detail.total}集` : '未知集数' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <calendar-icon class="text-white/70"/>
                      <span>{{ detail.releaseDate || '未知上映' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <layers-icon class="text-white/70"/>
                      <span>{{ detail.chapters?.length ? `${detail.chapters.length}个播放源` : '无播放源' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-2">
              <div
                class="rounded-2xl border border-white/25 bg-white/10 p-6 shadow-xl backdrop-blur dark:border-white/10">
                <div class="flex flex-wrap items-end gap-3">
                  <div class="text-3xl lg:text-4xl font-bold">{{ detail.title || '未命名' }}</div>
                  <div v-if="detail.subtitle" class="text-base text-white/75">{{ detail.subtitle }}</div>
                </div>

                <div v-if="detail.types?.length" class="mt-4 flex flex-wrap gap-2">
                  <t-tag
                    v-for="t in detail.types"
                    :key="t"
                    theme="primary"
                    variant="light"
                    shape="round"
                  >
                    {{ t }}
                  </t-tag>
                </div>

                <div class="mt-6 rounded-xl bg-black/20 p-5">
                  <div class="text-sm font-semibold text-white/90">简介</div>
                  <div class="mt-2 text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                    {{ contentText || '暂无简介' }}
                  </div>
                </div>

                <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div v-if="detail.actors?.length" class="rounded-xl bg-black/20 p-4">
                    <div class="text-sm font-semibold text-white/90">主演</div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="name in detail.actors.slice(0, 12)"
                        :key="name"
                        class="rounded-full bg-white/15 px-3 py-1 text-xs text-white/90"
                      >
                        {{ name }}
                      </span>
                    </div>
                  </div>

                  <div v-if="detail.directors?.length" class="rounded-xl bg-black/20 p-4">
                    <div class="text-sm font-semibold text-white/90">导演</div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="name in detail.directors.slice(0, 12)"
                        :key="name"
                        class="rounded-full bg-white/15 px-3 py-1 text-xs text-white/90"
                      >
                        {{ name }}
                      </span>
                    </div>
                  </div>

                  <div v-if="detail.writers?.length" class="rounded-xl bg-black/20 p-4">
                    <div class="text-sm font-semibold text-white/90">编剧</div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="name in detail.writers.slice(0, 12)"
                        :key="name"
                        class="rounded-full bg-white/15 px-3 py-1 text-xs text-white/90"
                      >
                        {{ name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="detail.chapters?.length"
                class="mt-6 rounded-2xl border border-white/25 bg-white/10 p-6 shadow-xl backdrop-blur dark:border-white/10"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="text-base font-semibold">剧集列表</div>
                  <t-button theme="default" variant="text" @click="openPlayer">在播放器中观看</t-button>
                </div>

                <div class="mt-4">
                  <t-tabs v-model="chapterTabId" size="medium">
                    <t-tab-panel
                      v-for="chapter in detail.chapters"
                      :key="chapter.id"
                      :label="chapter.name"
                      :value="chapter.id"
                    >
                      <div class="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        <t-button
                          v-for="(item, idx) in chapter.items"
                          :key="item.url"
                          theme="default"
                          variant="outline"
                          size="small"
                          class="truncate"
                          @click="openPlayer"
                        >
                          {{ item.name || idx + 1 }}
                        </t-button>
                      </div>
                    </t-tab-panel>
                  </t-tabs>
                </div>
              </div>

              <div
                v-if="detail.recommends?.length"
                class="mt-6 rounded-2xl border border-white/25 bg-white/10 p-6 shadow-xl backdrop-blur dark:border-white/10"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="text-base font-semibold">相关推荐</div>
                  <div class="text-xs text-white/70">共 {{ detail.recommends.length }} 部</div>
                </div>

                <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="item in detail.recommends.slice(0, 9)"
                    :key="item.id"
                    class="group cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-black/20 transition hover:bg-black/30"
                    @click="goToDetail(item)"
                  >
                    <div class="flex gap-4 p-4">
                      <img
                        v-if="item.cover"
                        :src="item.cover"
                        :alt="item.title"
                        class="h-24 w-16 flex-none rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div
                        v-else
                        class="h-24 w-16 flex-none rounded-lg bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/30 to-cyan-500/40"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="truncate text-sm font-semibold">{{ item.title }}</div>
                        <div class="mt-1 truncate text-xs text-white/70">
                          {{ item.releaseYear || item.releaseDate || '未知年份' }}
                        </div>
                        <div v-if="item.types?.length" class="mt-2 flex flex-wrap gap-1">
                          <t-tag
                            v-for="t in item.types.slice(0, 3)"
                            :key="t"
                            theme="primary"
                            size="small"
                            shape="round"
                            variant="light"
                            class="border-0 bg-white/15 text-white"
                          >
                            {{ t }}
                          </t-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {INetworkServer} from "@/modules/network/INetworkServer";
import type {NetworkDetail} from "@/modules/network/types/NetworkDetail";
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem";
import {useNetworkServerStore} from "@/store";
import {getNetworkListItem, setNetworkListItem} from "../components/detail";
import MessageUtil from "@/util/model/MessageUtil";
import {createWindows} from "@/lib/windows";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ImageIcon,
  LayersIcon,
  LocationIcon,
  PlayIcon,
  RefreshIcon,
  TimeIcon,
  TranslateIcon,
  VideoIcon
} from "tdesign-icons-vue-next";

const route = useRoute();
const router = useRouter();

const clientId = computed(() => route.params.id as string);
const mediaId = computed(() => route.params.mediaId as string);

const client = shallowRef<INetworkServer>();
const detail = ref<NetworkDetail>();
const loading = ref(false);
const error = ref("");
const chapterTabId = ref("");

const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
};

const contentText = computed(() => {
  const raw = detail.value?.content || "";
  return stripHtml(raw);
});

const loadDetail = async () => {
  loading.value = true;
  error.value = "";
  detail.value = undefined;

  try {
    const c = await useNetworkServerStore().getServerClient(clientId.value);
    client.value = c;

    detail.value = await c.getDetail(getNetworkListItem());

    if (detail.value?.chapters?.length) {
      chapterTabId.value = detail.value.chapters[0]?.id || "";
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "加载详情失败";
    MessageUtil.error("加载详情失败", e);
  } finally {
    loading.value = false;
  }
};

const openPlayer = async () => {
  if (!detail.value || !client.value) return;

  createWindows("network", {
    title: detail.value.title,
    serverId: clientId.value,
    mediaId: detail.value.id,
    itemId: detail.value.id,
    item: detail.value
  })

};

const goToDetail = (item: NetworkListItem) => {
  setNetworkListItem(item);
  router.push(`/network/${clientId.value}/detail/${item.id}`);
};

watch([clientId, mediaId], () => {
  loadDetail();
}, {immediate: true});

</script>

<style scoped lang="less">
:deep(.t-tabs) {
  background-color: transparent !important;
}
</style>
