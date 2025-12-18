<template>
  <div class="w-full h-full overflow-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <t-loading size="large" text="加载中..."/>
    </div>

    <div v-else-if="errorMessage" class="mx-auto max-w-5xl px-4 lg:px-8 py-10">
      <div class="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur">
        <div class="text-2xl font-semibold text-white">加载失败</div>
        <div class="mt-2 text-white/70 break-all">{{ errorMessage }}</div>
        <div class="mt-6 flex gap-3">
          <t-button theme="primary" @click="load">重试</t-button>
          <t-button theme="default" variant="outline" @click="router.back()">返回</t-button>
        </div>
      </div>
    </div>

    <div v-else-if="!details" class="flex items-center justify-center h-full">
      <t-loading size="large" text="加载中..."/>
    </div>

    <div v-else class="relative">
      <div class="absolute inset-0 overflow-hidden">
        <img
          v-if="details.imageUrl"
          :src="details.imageUrl"
          :alt="details.name"
          class="w-full h-full object-cover opacity-20 blur-sm scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>
      </div>

      <div class="sticky top-0 z-20 border-b border-white/20 bg-white/55 backdrop-blur dark:border-white/10 dark:bg-black/25">
        <div class="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center gap-3">
          <t-button theme="default" variant="outline" shape="circle" @click="router.back()">
            <template #icon>
              <chevron-left-icon/>
            </template>
          </t-button>
          <div class="min-w-0 flex-1">
            <div class="truncate text-lg font-semibold">{{ details.name || '未命名' }}</div>
          </div>
          <t-button theme="default" variant="outline" shape="circle" @click="load">
            <template #icon>
              <refresh-icon/>
            </template>
          </t-button>
        </div>
      </div>

      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1">
            <div class="sticky top-8">
              <div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <div class="flex items-center gap-4">
                  <div class="relative shrink-0">
                    <div class="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500/70 via-fuchsia-500/60 to-cyan-500/70 blur"/>
                    <img
                      v-if="details.imageUrl"
                      :src="details.imageUrl"
                      :alt="details.name"
                      class="relative w-24 h-24 rounded-full object-cover ring-2 ring-white/25"
                    />
                    <div
                      v-else
                      class="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/25 via-fuchsia-500/20 to-cyan-500/25 ring-2 ring-white/15 flex items-center justify-center"
                    >
                      <t-icon name="user" class="text-2xl text-white/70"/>
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="text-2xl font-bold text-white truncate">{{ details.name }}</div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <t-tag theme="primary" variant="light" shape="round">{{ personTypeLabel }}</t-tag>
                      <t-tag v-if="birthText" theme="default" variant="light" shape="round">{{ birthText }}</t-tag>
                      <t-tag v-if="worksCountText" theme="success" variant="light" shape="round">{{ worksCountText }}</t-tag>
                    </div>
                  </div>
                </div>

                <div class="mt-6 grid grid-cols-2 gap-3">
                  <div class="rounded-xl bg-black/20 p-4">
                    <div class="text-xs text-white/60">电影</div>
                    <div class="mt-1 text-2xl font-semibold text-white tabular-nums">{{ mediaCounts.movie }}</div>
                  </div>
                  <div class="rounded-xl bg-black/20 p-4">
                    <div class="text-xs text-white/60">剧集</div>
                    <div class="mt-1 text-2xl font-semibold text-white tabular-nums">{{ mediaCounts.series }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-6 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-white font-semibold">简介</div>
                  <t-button
                    v-if="details.biography && details.biography.length > bioPreviewLimit"
                    theme="default"
                    variant="text"
                    @click="bioExpanded = !bioExpanded"
                  >
                    {{ bioExpanded ? '收起' : '展开' }}
                  </t-button>
                </div>
                <div class="mt-3 text-sm text-white/75 leading-relaxed whitespace-pre-line">
                  {{ biographyText }}
                </div>
                <div v-if="!details.biography" class="mt-3 text-sm text-white/55">暂无简介</div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2">
            <div class="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div class="text-xl font-semibold text-white">参演影视</div>
                  <div class="mt-1 text-sm text-white/70">共 {{ media.length }} 部</div>
                </div>
                <div class="w-full sm:w-80">
                  <t-input v-model="keyword" clearable placeholder="搜索作品名称"/>
                </div>
              </div>

              <div class="mt-4">
                <t-tabs v-model="tab" size="medium">
                  <t-tab-panel label="全部" value="all"/>
                  <t-tab-panel :label="`电影 ${mediaCounts.movie}`" value="Movie"/>
                  <t-tab-panel :label="`剧集 ${mediaCounts.series}`" value="Series"/>
                </t-tabs>
              </div>

              <div v-if="filteredMedia.length === 0" class="mt-8 text-center text-white/70">
                暂无匹配作品
              </div>

              <div v-else class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <MediaCard
                  v-for="item in filteredMedia"
                  :key="item.id"
                  :item="item"
                  @click="goToDetail"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {MediaItem} from "@/modules/media/types/media/MediaItem.ts";
import type {MediaPerson} from "@/modules/media/types/person/MediaPerson.ts";
import {useMediaServerStore} from "@/store";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MediaCard from "@/pages/media/components/MediaCard.vue";
import {ChevronLeftIcon, RefreshIcon} from "tdesign-icons-vue-next";

type MediaTab = 'all' | MediaItem['type'];

const route = useRoute();
const router = useRouter();

const clientId = computed(() => route.params.id as string);
const personId = computed(() => route.params.personId as string);

const loading = ref(false);
const errorMessage = ref<string>();
const details = ref<MediaPerson>();
const media = ref<MediaItem[]>([]);

const keyword = ref<string>('');
const tab = ref<MediaTab>('all');

const bioExpanded = ref(false);
const bioPreviewLimit = 260;

const mediaCounts = computed(() => {
  const movie = media.value.filter((m) => m.type === 'Movie').length;
  const series = media.value.filter((m) => m.type === 'Series').length;
  return {movie, series};
});

const personTypeLabel = computed(() => {
  const type = details.value?.type;
  if (type === 'Actor') return '演员';
  if (type === 'Director') return '导演';
  if (type === 'Writer') return '编剧';
  if (type === 'Producer') return '制片';
  return '人物';
});

const birthText = computed(() => {
  const birthYear = details.value?.birthYear;
  const deathYear = details.value?.deathYear;
  if (!birthYear && !deathYear) return '';
  if (birthYear && deathYear) return `${birthYear} - ${deathYear}`;
  if (birthYear) return `${birthYear} - 至今`;
  return `- ${deathYear}`;
});

const worksCountText = computed(() => {
  const total = media.value.length;
  return total > 0 ? `作品 ${total}` : '';
});

const biographyText = computed(() => {
  const text = details.value?.biography?.trim() || '';
  if (!text) return '';
  if (bioExpanded.value) return text;
  if (text.length <= bioPreviewLimit) return text;
  return `${text.slice(0, bioPreviewLimit)}…`;
});

const filteredMedia = computed<MediaItem[]>(() => {
  const q = keyword.value.trim().toLowerCase();
  const selected = tab.value;

  const list = media.value
    .filter((item) => {
      if (selected === 'all') return true;
      return item.type === selected;
    })
    .filter((item) => {
      if (!q) return true;
      return item.name.toLowerCase().includes(q);
    })
    .slice()
    .sort((a, b) => {
      const yearA = a.year ?? 0;
      const yearB = b.year ?? 0;
      if (yearA !== yearB) return yearB - yearA;
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return a.name.localeCompare(b.name, 'zh-CN');
    });

  return list;
});

const load = async () => {
  loading.value = true;
  errorMessage.value = undefined;
  details.value = undefined;
  media.value = [];
  bioExpanded.value = false;
  tab.value = 'all';

  try {
    const client = await useMediaServerStore().getServerClient(clientId.value);
    const [d, m] = await Promise.all([
      client.getPersonDetails(personId.value),
      client.getPersonMedia(personId.value),
    ]);
    details.value = d;
    media.value = m;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载失败';
    MessageUtil.error('加载演员详情失败', error);
  } finally {
    loading.value = false;
  }
};

watch([clientId, personId], () => {
  load();
}, {immediate: true});

const goToDetail = (item: MediaItem) => {
  router.push(`/media/${clientId.value}/detail/${item.id}`);
};
</script>
