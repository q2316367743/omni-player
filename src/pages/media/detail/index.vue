<template>
  <div class="media-detail-page min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- 加载状态 -->
    <div v-if="!detail" class="flex items-center justify-center h-screen">
      <t-loading size="large" text="加载中..."/>
    </div>

    <!-- 详情内容 -->
    <div v-else class="relative">
      <!-- 背景图片 -->
      <div class="absolute inset-0 overflow-hidden">
        <img
          v-if="detail.backdropUrl"
          :src="detail.backdropUrl"
          :alt="detail.name"
          class="w-full h-full object-cover opacity-20 blur-sm scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>
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
            <div class="truncate text-lg font-semibold">{{ detail?.name || '未命名' }}</div>
          </div>
          <t-button theme="primary" class="shadow-lg" @click="handlePlay">
            <template #icon>
              <play-icon/>
            </template>
            播放
          </t-button>
        </div>
      </div>

      <!-- 主要内容 -->
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 左侧：海报和基本信息 -->
          <div class="lg:col-span-1">
            <div class="sticky top-8">
              <!-- 海报 -->
              <div class="relative group mb-6">
                <img
                  v-if="detail.posterUrl"
                  :src="detail.posterUrl"
                  :alt="detail.name"
                  class="w-full rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  v-else
                  class="w-full aspect-2/3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                >
                  <t-icon name="image" class="text-6xl text-white/60"/>
                </div>

                <!-- 悬浮播放按钮 -->
                <div
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div class="bg-black/50 backdrop-blur-sm rounded-full p-4">
                    <t-button
                      theme="primary"
                      shape="circle"
                      size="large"
                      class="shadow-xl"
                      @click="handlePlay"
                    >
                      <t-icon name="play" class="text-xl"/>
                    </t-button>
                  </div>
                </div>
              </div>

              <!-- 操作按钮组 -->
              <div class="grid grid-cols-2 gap-3 mb-6">
                <t-button
                  :theme="detail.userState?.isFavorite ? 'danger' : 'default'"
                  variant="outline"
                  block
                  @click="toggleFavorite"
                >
                  <template #icon>
                    <heart-filled-icon v-if="detail.userState?.isFavorite"/>
                    <heart-icon v-else/>
                  </template>
                  {{ detail.userState?.isFavorite ? '已收藏' : '收藏' }}
                </t-button>
                <t-button
                  theme="default"
                  variant="outline"
                  block
                  @click="showMoreActions"
                >
                  <template #icon>
                    <more-icon/>
                  </template>
                  更多
                </t-button>
              </div>

              <!-- 评分和统计 -->
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <t-icon name="star-filled" class="text-yellow-400 text-lg"/>
                    <span class="text-2xl font-bold text-white">{{ detail.rating?.toFixed(1) || 'N/A' }}</span>
                    <span class="text-gray-300 text-sm">/10</span>
                  </div>
                  <div v-if="detail.userState?.personalRating" class="text-blue-400 text-sm">
                    我的评分: {{ detail.userState.personalRating }}/10
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm text-gray-300">
                  <div class="flex items-center gap-2">
                    <t-icon name="calendar"/>
                    <span>{{ detail.year || '未知年份' }}</span>
                  </div>
                  <div v-if="detail.runtimeSeconds" class="flex items-center gap-2">
                    <t-icon name="time"/>
                    <span>{{ formatDuration(detail.runtimeSeconds) }}</span>
                  </div>
                </div>
              </div>

              <!-- 媒体信息 -->
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h4 class="text-white font-semibold mb-3">媒体信息</h4>
                <div class="space-y-2 text-sm text-gray-300">
                  <div v-if="detail.officialRating" class="flex items-center gap-2">
                    <t-icon name="warning"/>
                    <span>分级: {{ detail.officialRating }}</span>
                  </div>
                  <div v-if="detail.studios?.length" class="flex items-center gap-2">
                    <t-icon name="building"/>
                    <span>制片: {{ detail.studios.join(', ') }}</span>
                  </div>
                  <div v-if="detail.productionLocations?.length" class="flex items-center gap-2">
                    <t-icon name="location"/>
                    <span>拍摄地: {{ detail.productionLocations.join(', ') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：详细信息 -->
          <div class="lg:col-span-2">
            <!-- 标题和简介 -->
            <div class="mb-8">
              <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
                {{ detail.name }}
              </h1>
              <p v-if="detail.originalTitle && detail.originalTitle !== detail.name"
                 class="text-xl text-gray-300 mb-4">
                {{ detail.originalTitle }}
              </p>
              <p v-if="detail.tagline" class="text-lg text-blue-300 italic mb-6">
                {{ detail.tagline }}
              </p>
              <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                <h3 class="text-white font-semibold mb-3">简介</h3>
                <p class="text-gray-300 leading-relaxed">
                  {{ detail.overview || '暂无简介' }}
                </p>
              </div>
            </div>

            <!-- 类型标签 -->
            <div v-if="detail.genres?.length" class="mb-8 w-full">
              <h3 class="text-white font-semibold mb-4">类型</h3>
              <div class="flex flex-wrap gap-2">
                <t-tag
                  v-for="genre in detail.genres"
                  :key="genre"
                  theme="primary"
                  variant="outline"
                  shape="round"
                >
                  {{ genre }}
                </t-tag>
              </div>
            </div>

            <!-- 演职员信息 -->
            <div v-if="detail.people?.length" class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-semibold">演职员</h3>
                <t-button theme="default" variant="text" @click="showAllPeople">
                  查看全部
                </t-button>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
                <div
                  v-for="person in detail.people.slice(0, 8)"
                  :key="person.id"
                  class="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center hover:bg-white/20 transition-colors cursor-pointer"
                  @click="goToPerson(person.id)"
                >
                  <img
                    v-if="person.imageUrl"
                    :src="person.imageUrl"
                    :alt="person.name"
                    class="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 sm:mb-3 object-cover"
                  />
                  <div v-else
                       class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                    <t-icon name="user" class="text-gray-300 text-lg sm:text-xl"/>
                  </div>
                  <h4 class="text-white font-medium text-xs sm:text-sm mb-1">{{ person.name }}</h4>
                  <p v-if="person.role" class="text-gray-400 text-xs">{{ person.role }}</p>
                </div>
              </div>
            </div>

            <!-- 章节信息 -->
            <div v-if="detail.chapters?.length" class="mb-8">
              <h3 class="text-white font-semibold mb-4">章节</h3>
              <div class="space-y-3">
                <div
                  v-for="(chapter, index) in detail.chapters.slice(0, 6)"
                  :key="index"
                  class="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-pointer"
                  @click="seekToChapter(chapter.startSeconds)"
                >
                  <div
                    class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <h4 class="text-white font-medium">{{ chapter.title }}</h4>
                    <p class="text-gray-400 text-sm">{{ formatTime(chapter.startSeconds) }}</p>
                  </div>
                  <t-icon name="play-circle" class="text-blue-400 text-xl"/>
                </div>
              </div>
            </div>

            <!-- 观看状态 -->
            <div v-if="detail.userState"
                 class="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 mb-8">
              <h3 class="text-white font-semibold mb-4">观看状态</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-400 mb-1">
                    {{ detail.userState.playCount }}
                  </div>
                  <div class="text-gray-300 text-sm">观看次数</div>
                </div>
                <div v-if="detail.userState.lastPlayedAt" class="text-center">
                  <div class="text-lg font-semibold text-blue-400 mb-1">
                    {{ formatDate(detail.userState.lastPlayedAt) }}
                  </div>
                  <div class="text-gray-300 text-sm">上次观看</div>
                </div>
                <div v-if="detail.userState.playbackPositionSeconds" class="text-center">
                  <div class="text-lg font-semibold text-yellow-400 mb-1">
                    {{ formatTime(detail.userState.playbackPositionSeconds) }}
                  </div>
                  <div class="text-gray-300 text-sm">观看进度</div>
                </div>
              </div>

              <!-- 观看进度条 -->
              <div v-if="detail.runtimeSeconds && detail.userState.playbackPositionSeconds" class="mt-4">
                <div class="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    class="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-300"
                    :style="{ width: `${Math.min((detail.userState.playbackPositionSeconds / detail.runtimeSeconds) * 100, 100)}%` }"
                  />
                </div>
                <div class="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{{ formatTime(detail.userState.playbackPositionSeconds) }}</span>
                  <span>{{ formatTime(detail.runtimeSeconds) }}</span>
                </div>
              </div>
            </div>

            <!-- 媒体源信息 -->
            <div v-if="detail.mediaSources?.length" class="mb-8">
              <h3 class="text-white font-semibold mb-4">媒体源</h3>
              <div class="space-y-4">
                <div
                  v-for="(source, index) in detail.mediaSources"
                  :key="source.id"
                  class="bg-white/10 backdrop-blur-sm rounded-xl p-6"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-white font-semibold">媒体源 {{ index + 1 }}</h4>
                    <div class="flex items-center gap-2">
                      <t-tag theme="primary" variant="light">{{ source.container.toUpperCase() }}</t-tag>
                      <t-tag v-if="source.sizeBytes" theme="default" variant="light">
                        {{ formatFileSize(source.sizeBytes) }}
                      </t-tag>
                    </div>
                  </div>

                  <!-- 视频流 -->
                  <div v-if="source.videoStreams?.length" class="mb-4">
                    <h5 class="text-blue-300 font-medium mb-2 flex items-center gap-2">
                      <t-icon name="desktop"/>
                      视频流
                    </h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        v-for="stream in source.videoStreams"
                        :key="stream.id"
                        class="bg-black/20 rounded-lg p-3"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-white font-medium">{{ stream.title || '主视频' }}</span>
                          <t-tag v-if="stream.isDefault" theme="success" size="small">默认</t-tag>
                        </div>
                        <div class="text-sm text-gray-300 space-y-1">
                          <div>编码: {{ stream.codec.toUpperCase() }}</div>
                          <div v-if="stream.language">语言: {{ getLanguageName(stream.language) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 音频流 -->
                  <div v-if="source.audioStreams?.length" class="mb-4">
                    <h5 class="text-green-300 font-medium mb-2 flex items-center gap-2">
                      <t-icon name="volume"/>
                      音频流
                    </h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        v-for="stream in source.audioStreams"
                        :key="stream.id"
                        class="bg-black/20 rounded-lg p-3"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-white font-medium">{{ stream.title || '主音频' }}</span>
                          <t-tag v-if="stream.isDefault" theme="success" size="small">默认</t-tag>
                        </div>
                        <div class="text-sm text-gray-300 space-y-1">
                          <div>编码: {{ stream.codec.toUpperCase() }}</div>
                          <div v-if="stream.language">语言: {{ getLanguageName(stream.language) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 字幕流 -->
                  <div v-if="source.subtitleStreams?.length">
                    <h5 class="text-yellow-300 font-medium mb-2 flex items-center gap-2">
                      <t-icon name="subtitle"/>
                      字幕流
                    </h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        v-for="stream in source.subtitleStreams"
                        :key="stream.id"
                        class="bg-black/20 rounded-lg p-3"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-white font-medium">{{ stream.title || '字幕' }}</span>
                          <div class="flex gap-1">
                            <t-tag v-if="stream.isDefault" theme="success" size="small">默认</t-tag>
                            <t-tag v-if="stream.isForced" theme="warning" size="small">强制</t-tag>
                            <t-tag v-if="stream.isExternal" theme="primary" size="small">外挂</t-tag>
                          </div>
                        </div>
                        <div class="text-sm text-gray-300 space-y-1">
                          <div>编码: {{ stream.codec.toUpperCase() }}</div>
                          <div v-if="stream.language">语言: {{ getLanguageName(stream.language) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="detail.type === 'Series'" class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-semibold">剧集</h3>
                <div class="text-xs text-white/70">共 {{ season?.items?.length || 0 }} 季</div>
              </div>

              <div
                class="rounded-2xl border border-white/25 bg-white/10 p-6 shadow-xl backdrop-blur dark:border-white/10"
              >
                <t-tabs v-model="selectedSeasonId" size="medium">
                  <t-tab-panel
                    v-for="s in season?.items || []"
                    :key="s.id"
                    :label="s.name"
                    :value="s.id"
                  >
                    <div v-if="episodeLoadingMap[s.id]" class="flex items-center justify-center py-10">
                      <t-loading text="加载剧集..." />
                    </div>
                    <div v-else-if="episodeErrorMap[s.id]" class="py-8 text-center text-sm text-red-200">
                      {{ episodeErrorMap[s.id] }}
                    </div>
                    <div
                      v-else-if="(episodeCacheMap[s.id] || []).length"
                      class="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2"
                    >
                      <t-tooltip
                        v-for="(ep, idx) in episodeCacheMap[s.id]"
                        :key="ep.id"
                        :content="ep.name"
                      >
                        <t-button
                          :theme="ep.userData?.played ? 'default' : 'primary'"
                          variant="outline"
                          size="small"
                          class="truncate"
                          @click="playEpisode(ep)"
                        >
                          {{ ep.indexNumber ?? (idx + 1) }}
                        </t-button>
                      </t-tooltip>
                    </div>
                    <div v-else class="py-8 text-center text-sm text-white/70">暂无剧集</div>
                  </t-tab-panel>
                </t-tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {MediaDetail} from "@/modules/media/types/detail/MediaDetail.ts";
import {useMediaServerStore} from "@/store";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {ChevronLeftIcon, HeartFilledIcon, HeartIcon, MoreIcon, PlayIcon} from "tdesign-icons-vue-next";
import {createWindows} from "@/lib/windows.ts";
import type {MediaSeason} from "@/modules/media/types/detail/MediaSeason.ts";
import type {MediaEpisodeItem} from "@/modules/media/types/detail/MediaEpisode.ts";
import type {IMediaServer} from "@/modules/media/IMediaServer.ts";

defineOptions({ name: 'MediaDetail' });

const route = useRoute();
const router = useRouter();

const clientId = route.params.id as string;
const mediaId = route.params.mediaId as string;

const detail = ref<MediaDetail>();
const season = ref<MediaSeason>();
const selectedSeasonId = ref<string>("");

const client = shallowRef<IMediaServer>();
const episodeCacheMap = reactive<Record<string, MediaEpisodeItem[]>>({});
const episodeLoadingMap = reactive<Record<string, boolean>>({});
const episodeErrorMap = reactive<Record<string, string>>({});

const loadEpisodesBySeasonId = async (seasonId: string) => {
  if (!seasonId) return;
  if (episodeCacheMap[seasonId]?.length) return;
  if (episodeLoadingMap[seasonId]) return;

  episodeLoadingMap[seasonId] = true;
  episodeErrorMap[seasonId] = "";

  try {
    const c = client.value ?? await useMediaServerStore().getServerClient(clientId);
    client.value = c;
    const res = await c.getItemEpisode(mediaId, seasonId);
    episodeCacheMap[seasonId] = res.items || [];
  } catch (e) {
    episodeErrorMap[seasonId] = e instanceof Error ? e.message : "加载剧集失败";
    MessageUtil.error("加载剧集失败", e);
  } finally {
    episodeLoadingMap[seasonId] = false;
  }
};

watch(selectedSeasonId, (id) => {
  if (!id) return;
  loadEpisodesBySeasonId(id);
});

// 加载详情数据
onMounted(async () => {
  try {
    const c = await useMediaServerStore().getServerClient(clientId);
    client.value = c;
    detail.value = await c.getItem(mediaId);
    if (detail.value.type === 'Series') {
      // 获取剧集信息
      season.value = await c.getItemSeason(mediaId);
      const firstSeasonId = season.value.items?.[0]?.id || "";
      selectedSeasonId.value = firstSeasonId;
      if (firstSeasonId) {
        await loadEpisodesBySeasonId(firstSeasonId);
        void (async () => {
          const ids = (season.value?.items || []).map(s => s.id).filter(Boolean);
          for (const id of ids) {
            if (!episodeCacheMap[id]?.length) {
              await loadEpisodesBySeasonId(id);
            }
          }
        })();
      }
    }
  } catch (error) {
    MessageUtil.error('加载媒体详情失败', error);
  }
});

// 格式化时长
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

// 格式化时间（秒转时分秒）
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取语言名称
const getLanguageName = (code: string): string => {
  const languages: Record<string, string> = {
    'eng': '英语',
    'chi': '中文',
    'jpn': '日语',
    'kor': '韩语',
    'fre': '法语',
    'ger': '德语',
    'spa': '西班牙语',
    'rus': '俄语',
    'ara': '阿拉伯语',
    'hin': '印地语',
    'por': '葡萄牙语',
    'ita': '意大利语',
    'dut': '荷兰语',
    'swe': '瑞典语',
    'pol': '波兰语',
    'cze': '捷克语',
    'dan': '丹麦语',
    'fin': '芬兰语',
    'nor': '挪威语',
    'heb': '希伯来语',
    'tha': '泰语',
    'vie': '越南语',
    'ind': '印尼语',
    'may': '马来语',
    'tur': '土耳其语'
  };
  return languages[code] || code.toUpperCase();
};

const loadAllEpisodes = async () => {
  const ids = (season.value?.items || []).map(s => s.id).filter(Boolean);
  if (!ids.length) return;
  await Promise.allSettled(ids.map(id => loadEpisodesBySeasonId(id)));
};

const pickLastPlayedEpisode = (): MediaEpisodeItem | undefined => {
  let bestByTime: { episode: MediaEpisodeItem; time: number } | undefined;
  let bestByProgress: { episode: MediaEpisodeItem; progress: number } | undefined;

  for (const eps of Object.values(episodeCacheMap)) {
    for (const ep of eps) {
      const t = ep.userData?.lastPlayedDate ? new Date(ep.userData.lastPlayedDate).getTime() : NaN;
      if (Number.isFinite(t)) {
        if (!bestByTime || t > bestByTime.time) bestByTime = { episode: ep, time: t };
        continue;
      }

      const progress = ep.userData?.playbackPositionMs;
      if (typeof progress === "number" && progress > 0) {
        if (!bestByProgress || progress > bestByProgress.progress) {
          bestByProgress = { episode: ep, progress };
        }
      }
    }
  }

  return bestByTime?.episode || bestByProgress?.episode;
};

const playEpisode = (episode: MediaEpisodeItem) => {
  if (!detail.value) return;
  if (episode.seasonId && selectedSeasonId.value !== episode.seasonId) {
    selectedSeasonId.value = episode.seasonId;
  }
  createWindows("media", {
    title: `${detail.value.name} - ${episode.name}`,
    serverId: clientId,
    mediaId: detail.value.id,
    itemId: episode.id,
  });
};

// 播放视频
const handlePlay = async () => {
  if (!detail.value) return;

  // 这里可以添加播放逻辑
  if (detail.value.type !== "Series") {
    createWindows("media", {
      title: detail.value.name,
      serverId: clientId,
      mediaId: detail.value.id,
      itemId: detail.value.id,
    });
    return;
  }

  if (!season.value) {
    const c = client.value ?? await useMediaServerStore().getServerClient(clientId);
    client.value = c;
    season.value = await c.getItemSeason(mediaId);
  }

  const seasonId = selectedSeasonId.value || season.value?.items?.[0]?.id || "";
  if (!seasonId) {
    MessageUtil.info("暂无剧集可播放");
    return;
  }

  await loadAllEpisodes();
  const lastPlayed = pickLastPlayedEpisode();
  if (lastPlayed) {
    playEpisode(lastPlayed);
    return;
  }

  await loadEpisodesBySeasonId(seasonId);
  const list = episodeCacheMap[seasonId] || [];
  if (!list.length) {
    MessageUtil.info("暂无剧集可播放");
    return;
  }
  const fallback = list.find(ep => ep.userData?.played !== true) || list[0]!;
  playEpisode(fallback);
};

// 切换收藏状态
const toggleFavorite = async () => {
  if (!detail.value) return;

  // try {
  //   const client = await useMediaServerStore().getServerClient(clientId);
  //   await client.toggleFavorite(detail.value.id);
  //
  //   // 更新本地状态
  //   if (detail.value.userState) {
  //     detail.value.userState.isFavorite = !detail.value.userState.isFavorite;
  //   }
  //
  //   MessagePlugin.success(detail.value.userState?.isFavorite ? '已添加到收藏' : '已取消收藏');
  // } catch (error) {
  //   console.error('切换收藏状态失败:', error);
  //   MessagePlugin.error('操作失败');
  // }
};

// 显示更多操作
const showMoreActions = () => {
  // 这里可以显示更多操作菜单
  MessageUtil.info('更多功能开发中...');
};

// 显示所有演职员
const showAllPeople = () => {
  // 跳转到演职员列表页面
  router.push(`/media/${clientId}/person`);
};

// 跳转到演职员详情
const goToPerson = (personId: string) => {
  router.push(`/media/${clientId}/person/${personId}`);
};

// 跳转到章节
const seekToChapter = (seconds: number) => {
  console.log('跳转到章节:', seconds);
  // 这里可以添加跳转逻辑
};
</script>

<style scoped>
/* 自定义滚动条 */
.media-detail-page::-webkit-scrollbar {
  width: 8px;
}

.media-detail-page::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.media-detail-page::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.media-detail-page::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 防止内容溢出 */
.media-detail-page {
  width: 100vw;
  height: calc(100vh - 33px);
  overflow: auto;
  max-width: 100%;
  box-sizing: border-box;
}

/* 确保所有子元素正确计算宽度 */
.media-detail-page * {
  box-sizing: border-box;
}
:deep(.t-tabs) {
  background-color: transparent !important;
}
</style>
