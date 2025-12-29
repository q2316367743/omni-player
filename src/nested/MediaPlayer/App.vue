<template>
  <t-layout class="player-root">
    <t-content>
    <div class="quality-control" v-if="qualityOptions.length">
      <t-popup v-model:visible="qualityPopupVisible" placement="bottom-right" trigger="click">
        <t-button theme="default" variant="outline" size="small">
          {{ currentQualityLabel }}
        </t-button>
        <template #content>
          <div class="quality-panel">
            <t-radio-group
              v-model="selectedQualityId"
              :options="qualityRadioOptions"
              @change="onQualityRadioChange"
            />
          </div>
        </template>
      </t-popup>
    </div>

    <art-player
      :url="url"
      :subtitle-urls="subtitleUrls"
      :initial-position-ms="playbackInfoRef?.initialPositionMs"
      v-if="status === 'artplayer'"
      @next="$emit('next')"
      @playback="handlePlayback"
    />
    <t-loading v-else text="正在加载中"/>
    </t-content>
    <t-aside width="420px">
      <div v-if="detail" class="h-full overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div class="p-4">
          <div class="flex gap-4">
            <div class="w-28 shrink-0">
              <img v-if="detail.posterUrl" :src="detail.posterUrl" :alt="detail.name" class="w-28 h-40 object-cover rounded-2xl shadow-xl"/>
              <div v-else class="w-28 h-40 rounded-2xl bg-gradient-to-br from-blue-500/35 via-purple-500/25 to-cyan-500/35"/>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-base font-semibold leading-snug">{{ detail.name }}</div>
              <div v-if="detail.originalTitle && detail.originalTitle !== detail.name" class="mt-1 text-xs text-white/65 truncate">{{ detail.originalTitle }}</div>

              <div class="mt-2 flex flex-wrap gap-2">
                <t-tag theme="primary" variant="light" shape="round" class="border-0 bg-white/15 text-white">
                  {{ typeLabel(detail.type) }}
                </t-tag>
                <t-tag v-if="detail.year" theme="default" variant="light" shape="round" class="border-0 bg-black/30 text-white">
                  <span class="tabular-nums">{{ detail.year }}</span>
                </t-tag>
                <t-tag v-if="typeof detail.rating === 'number'" theme="success" variant="light" shape="round" class="border-0 bg-black/30 text-white">
                  <span class="tabular-nums">{{ detail.rating.toFixed(1) }}</span>
                </t-tag>
                <t-tag v-if="detail.runtimeSeconds" theme="default" variant="light" shape="round" class="border-0 bg-black/30 text-white">
                  {{ formatDuration(detail.runtimeSeconds) }}
                </t-tag>
              </div>

              <div v-if="detail.userState?.playbackPositionSeconds && detail.runtimeSeconds" class="mt-3 rounded-xl bg-white/10 p-3 backdrop-blur">
                <div class="flex items-center justify-between text-xs text-white/70">
                  <div>观看进度</div>
                  <div class="tabular-nums">
                    {{ Math.min(100, Math.floor((detail.userState.playbackPositionSeconds / detail.runtimeSeconds) * 100)) }}%
                  </div>
                </div>
                <div class="mt-2 h-2 rounded-full bg-white/15 overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    :style="{ width: `${Math.min(100, (detail.userState.playbackPositionSeconds / detail.runtimeSeconds) * 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <InfoCircleIcon/>
              <span>简介</span>
            </div>
            <div class="mt-2 text-sm text-white/75 leading-relaxed">
              <t-paragraph :ellipsis="{row: 6, expandable: true, collapsible: true}">
                {{ detail.overview || '暂无简介' }}
              </t-paragraph>
            </div>
          </div>

          <div v-if="detail.genres?.length" class="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <div class="text-sm font-semibold">类型</div>
            <div class="mt-2 flex flex-wrap gap-2">
              <t-tag v-for="g in detail.genres" :key="g" theme="primary" variant="light" shape="round" class="border-0 bg-white/12 text-white">
                {{ g }}
              </t-tag>
            </div>
          </div>

          <div v-if="seriesReady" class="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold">剧集</div>
              <div class="text-xs text-white/60">
                当前播放：<span class="font-mono">{{ activeItemId.slice(0, 8) }}</span>
              </div>
            </div>

            <div v-if="seasonLoading" class="flex items-center justify-center py-8">
              <t-loading text="加载季信息..."/>
            </div>
            <div v-else-if="seasonError" class="py-6 text-center text-sm text-red-200">{{ seasonError }}</div>
            <template v-else-if="season?.items?.length">
              <div class="mt-3">
                <div class="flex gap-2 overflow-x-auto pb-2">
                  <t-button
                    v-for="(s, idx) in season.items"
                    :key="s.id"
                    size="small"
                    :theme="selectedSeasonId === s.id ? 'primary' : 'default'"
                    :variant="selectedSeasonId === s.id ? 'base' : 'outline'"
                    class="shrink-0"
                    @click="selectedSeasonId = s.id"
                  >
                    {{ seasonLabel(s, idx) }}
                  </t-button>
                </div>

                <div v-if="selectedSeasonId" class="mt-3">
                  <div v-if="episodeLoadingMap[selectedSeasonId]" class="flex items-center justify-center py-8">
                    <t-loading text="加载剧集..."/>
                  </div>
                  <div v-else-if="episodeErrorMap[selectedSeasonId]" class="py-6 text-center text-sm text-red-200">
                    {{ episodeErrorMap[selectedSeasonId] }}
                  </div>
                  <div v-else-if="episodeCacheMap[selectedSeasonId]?.length" class="grid grid-cols-4 gap-2">
                    <t-tooltip v-for="(ep, idx) in episodeCacheMap[selectedSeasonId]" :key="ep.id" :content="ep.name" placement="top">
                      <t-button
                        :theme="activeItemId === ep.id ? 'primary' : ep.userData?.played ? 'default' : 'primary'"
                        :variant="activeItemId === ep.id ? 'base' : 'outline'"
                        size="small"
                        :class="['truncate', activeItemId === ep.id ? 'shadow-lg shadow-blue-500/20' : '']"
                        @click="switchEpisode(ep)"
                      >
                        <span class="inline-flex items-center gap-1 min-w-0">
                          <PlayCircleIcon v-if="activeItemId === ep.id"/>
                          <span class="tabular-nums">{{ ep.indexNumber ?? idx + 1 }}</span>
                          <span v-if="progressText(ep)" class="text-[10px] text-white/60 truncate">{{ progressText(ep) }}</span>
                        </span>
                      </t-button>
                    </t-tooltip>
                  </div>
                  <div v-else class="py-6 text-center text-sm text-white/60">暂无剧集</div>
                </div>
                <div v-else class="py-6 text-center text-sm text-white/60">暂无剧集</div>
              </div>
            </template>
            <div v-else class="py-6 text-center text-sm text-white/60">暂无剧集</div>
          </div>
        </div>
      </div>
      <div v-else class="h-full flex items-center justify-center text-white/60">
        <t-loading text="加载详情..."/>
      </div>
    </t-aside>
  </t-layout>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, ref, shallowRef, watch} from 'vue';
import {getAllWindows, getCurrentWindow} from '@tauri-apps/api/window';
import type {WindowPayload} from '@/lib/windows.ts';
import {fetchMediaClient} from '@/store';
import type {IMediaServer} from "@/modules/media/IMediaServer.ts";
import type {MediaPlaybackReport, MediaPlaybackState} from "@/modules/media/types/playback/MediaPlaybackReport.ts";
import type {MediaPlaybackInfo} from "@/modules/media/types/playback/MediaPlaybackInfo.ts";
import type {MediaDetail} from '@/modules/media/types/detail/MediaDetail.ts';
import type {MediaEpisodeItem} from '@/modules/media/types/detail/MediaEpisode.ts';
import type {MediaSeason, MediaSeasonItem} from '@/modules/media/types/detail/MediaSeason.ts';
import {InfoCircleIcon, PlayCircleIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import ArtPlayer from "../NetworkPlayer/components/ArtPlayer.vue";

const url = ref('')

const clientRef = shallowRef<IMediaServer>();
const itemIdRef = ref<string>('');
const playbackInfoRef = shallowRef<MediaPlaybackInfo>();
const playbackStartTimeRef = ref<number>();
const lastPlaybackRef = shallowRef<{ state: MediaPlaybackState; positionMs: number; durationMs?: number }>();

const detail = shallowRef<MediaDetail>();
const activeItemId = ref('');
const season = shallowRef<MediaSeason>();
const selectedSeasonId = ref('');
const seasonLoading = ref(false);
const seasonError = ref<string>();
const episodeCacheMap = reactive<Record<string, MediaEpisodeItem[]>>({});
const episodeLoadingMap = reactive<Record<string, boolean>>({});
const episodeErrorMap = reactive<Record<string, string>>({});

function typeLabel(type: MediaDetail['type']) {
  if (type === 'Movie') return '电影';
  if (type === 'Series') return '剧集';
  return type;
}

function formatDuration(seconds?: number) {
  if (typeof seconds !== 'number' || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}小时${m}分钟`;
  return `${m}分钟`;
}

function formatDurationMs(ms?: number) {
  if (typeof ms !== 'number' || ms <= 0) return '';
  return formatDuration(Math.floor(ms / 1000));
}

function seasonLabel(s: MediaSeasonItem, idx: number) {
  if (typeof s.indexNumber === 'number') {
    const n = String(Math.max(0, s.indexNumber)).padStart(2, '0');
    return `S${n}`;
  }
  if (s.name) return s.name;
  return `第${idx + 1}季`;
}

function progressText(ep: MediaEpisodeItem) {
  if (typeof ep.userData?.playbackPositionMs === 'number' && ep.userData.playbackPositionMs > 0) {
    return formatDurationMs(ep.userData.playbackPositionMs);
  }
  return '';
}

const loadEpisodesBySeasonId = async (seasonId: string) => {
  if (!seasonId) return;
  if (episodeLoadingMap[seasonId]) return;
  episodeLoadingMap[seasonId] = true;
  episodeErrorMap[seasonId] = '';

  try {
    const client = clientRef.value;
    if (!client || !detail.value) return;
    const res = await client.getItemEpisode(detail.value.id, seasonId);
    episodeCacheMap[seasonId] = res.items || [];
  } catch (e) {
    episodeErrorMap[seasonId] = e instanceof Error ? e.message : '加载剧集失败';
  } finally {
    episodeLoadingMap[seasonId] = false;
  }
};

const switchEpisode = async (ep: MediaEpisodeItem) => {
  if (activeItemId.value === ep.id) return;
  if (!clientRef.value || !detail.value) return;

  await reportStopped();
  
  activeItemId.value = ep.id;
  itemIdRef.value = ep.id;
  resetReportContext();
  selectedQualityId.value = 'auto';
  qualityPopupVisible.value = false;
  hlsQualityOptionsRef.value = [];

  const playbackInfo = await clientRef.value.getPlaybackInfo(ep.id);
  playbackInfoRef.value = playbackInfo;

  url.value = playbackInfo.streamUrl;
  void loadHlsVariants(url.value);
};

const seriesReady = computed(() => detail.value?.type === 'Series');

watch(selectedSeasonId, (id) => {
  if (!id) return;
  if (episodeCacheMap[id]?.length) return;
  void loadEpisodesBySeasonId(id);
});

const status = ref<'artplayer' | "loading">('loading');

type QualityOption =
  | { id: string; label: string; kind: 'hls'; url: string }
  | { id: string; label: string; kind: 'transcode'; maxBitrate?: number };

const qualityPopupVisible = ref(false);
const selectedQualityId = ref<string>('auto');
const hlsQualityOptionsRef = ref<Array<{ id: string; label: string; url: string }>>([]);

const transcodePresetOptions = computed<QualityOption[]>(() => ([
  {id: 'auto', label: '自动', kind: 'transcode'},
  {id: '1080p', label: '1080P', kind: 'transcode', maxBitrate: 10_000_000},
  {id: '720p', label: '720P', kind: 'transcode', maxBitrate: 5_000_000},
  {id: '480p', label: '480P', kind: 'transcode', maxBitrate: 2_000_000},
  {id: '360p', label: '360P', kind: 'transcode', maxBitrate: 1_000_000},
]));

const qualityOptions = computed<QualityOption[]>(() => {
  if (hlsQualityOptionsRef.value.length > 1) {
    return hlsQualityOptionsRef.value.map(o => ({id: o.id, label: o.label, kind: 'hls', url: o.url}));
  }
  if (url.value) return transcodePresetOptions.value;
  return [];
});

const currentQualityLabel = computed(() => {
  const opt = qualityOptions.value.find(o => o.id === selectedQualityId.value);
  return opt?.label || '清晰度';
});

const qualityRadioOptions = computed(() => qualityOptions.value.map(o => ({label: o.label, value: o.id})));

const subtitleUrls = computed(() => playbackInfoRef.value?.subtitleUrls ?? []);

function resetReportContext() {
  playbackStartTimeRef.value = undefined;
  lastPlaybackRef.value = undefined;
}

async function reportStopped() {
  const client = clientRef.value;
  const itemId = itemIdRef.value;
  if (!client || !itemId) return;

  const last = lastPlaybackRef.value;
  const report: MediaPlaybackReport = {
    itemId,
    positionMs: last?.positionMs ?? 0,
    durationMs: last?.durationMs,
    state: 'stopped',
    playbackStartTime: playbackStartTimeRef.value,
  };
  await client.report(report).catch(() => undefined);
}

function handlePlayback(payload: { state: MediaPlaybackState; positionMs: number; durationMs?: number }) {
  lastPlaybackRef.value = payload;

  const client = clientRef.value;
  const itemId = itemIdRef.value;
  if (!client || !itemId) return;

  if (payload.state === 'playing' && typeof playbackStartTimeRef.value !== 'number') {
    playbackStartTimeRef.value = Date.now();
  }

  const report: MediaPlaybackReport = {
    itemId,
    positionMs: payload.positionMs,
    durationMs: payload.durationMs,
    state: payload.state,
    playbackStartTime: playbackStartTimeRef.value,
  };

  void client.report(report)
    .then(() => {
      console.log("事件上报", report);
    });
}

function inferTypeFromUrl(nextUrl: string, fallbackContainer?: string) {
  let path: string | undefined = undefined;
  try {
    path = new URL(nextUrl).pathname.toLowerCase();
  } catch {
    path = undefined;
  }
  if (path) {
    if (path.endsWith('.m3u8')) return 'm3u8';
    if (path.endsWith('.flv')) return 'flv';
    if (path.endsWith('.mp4') || path.endsWith('.mkv')) return 'mp4';
  }
  if (fallbackContainer === 'm3u8') return 'm3u8';
  if (fallbackContainer === 'flv') return 'flv';
  return 'mp4';
}

async function loadHlsVariants(masterUrl: string) {
  if (inferTypeFromUrl(masterUrl) !== 'm3u8') {
    hlsQualityOptionsRef.value = [];
    return;
  }
  try {
    const res = await fetch(masterUrl);
    if (!res.ok) {
      hlsQualityOptionsRef.value = [];
      return;
    }
    const text = await res.text();
    const lines = text.split(/\r?\n/);

    const variants: Array<{ url: string; height?: number; bandwidth?: number; name?: string }> = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      if (!line.startsWith('#EXT-X-STREAM-INF:')) continue;

      const attrs = line.slice('#EXT-X-STREAM-INF:'.length);
      let urlLine: string | undefined = undefined;
      for (let j = i + 1; j < lines.length; j++) {
        const candidate = (lines[j] ?? '').trim();
        if (!candidate) continue;
        if (candidate.startsWith('#')) continue;
        urlLine = candidate;
        break;
      }
      if (!urlLine) continue;

      const bandwidthMatch = attrs.match(/BANDWIDTH=(\d+)/);
      const resolutionMatch = attrs.match(/RESOLUTION=(\d+)x(\d+)/);
      const nameMatch = attrs.match(/NAME="([^"]+)"/);

      const bandwidth = bandwidthMatch ? Number(bandwidthMatch[1]) : undefined;
      const height = resolutionMatch ? Number(resolutionMatch[2]) : undefined;
      const name = nameMatch ? nameMatch[1] : undefined;

      variants.push({
        url: new URL(urlLine, masterUrl).toString(),
        height: Number.isFinite(height) ? height : undefined,
        bandwidth: Number.isFinite(bandwidth) ? bandwidth : undefined,
        name,
      });
    }

    if (!variants.length) {
      hlsQualityOptionsRef.value = [];
      return;
    }

    const dedup = new Map<string, { url: string; height?: number; bandwidth?: number; name?: string }>();
    for (const v of variants) dedup.set(v.url, v);

    const sorted = Array.from(dedup.values()).sort((a, b) => {
      const ha = a.height ?? -1;
      const hb = b.height ?? -1;
      if (hb !== ha) return hb - ha;
      return (b.bandwidth ?? -1) - (a.bandwidth ?? -1);
    });

    const mapped = sorted.map((v, idx) => {
      const label = v.name
        || (typeof v.height === 'number' ? `${v.height}P` : undefined)
        || (typeof v.bandwidth === 'number' ? `${Math.round(v.bandwidth / 1000)}kbps` : undefined)
        || `线路${idx + 1}`;
      return {id: `hls-${idx}`, label, url: v.url};
    });

    hlsQualityOptionsRef.value = [{id: 'auto', label: '自动', url: masterUrl}, ...mapped];
  } catch {
    hlsQualityOptionsRef.value = [];
  }
}

let qualitySwitchSeq = 0;
function onQualityRadioChange(value: string | number | boolean) {
  void handleQualityChange(String(value));
}

async function handleQualityChange(optionId: string) {
  selectedQualityId.value = optionId;
  qualityPopupVisible.value = false;
  playbackStartTimeRef.value = undefined;

  const option = qualityOptions.value.find(o => o.id === optionId);
  if (!option) return;

  const seq = ++qualitySwitchSeq;

  if (option.kind === 'hls') {
    url.value = option.url;
    if (seq === qualitySwitchSeq) void loadHlsVariants(option.url);
    return;
  }

  const client = clientRef.value;
  const itemId = itemIdRef.value;
  if (!client || !itemId) return;

  const playbackInfo = await client.getPlaybackInfo(itemId, {maxBitrate: option.maxBitrate}).catch(() => undefined);
  if (!playbackInfo) return;
  if (seq !== qualitySwitchSeq) return;

  playbackInfoRef.value = playbackInfo;
  url.value = playbackInfo.streamUrl;
  void loadHlsVariants(url.value);
}

onMounted(async () => {

  const current = getCurrentWindow();
  status.value = 'artplayer';

  const unlistenInit = await current.listen<WindowPayload>('init', async ({payload}) => {
    const {serverId, itemId, mediaId} = payload;
    activeItemId.value = itemId;

    if (itemIdRef.value && itemIdRef.value !== itemId) {
      await reportStopped();
    }

    const client = await fetchMediaClient(serverId);
    clientRef.value = client;
    itemIdRef.value = itemId;
    resetReportContext();
    playbackInfoRef.value = undefined;
    selectedQualityId.value = 'auto';
    qualityPopupVisible.value = false;
    hlsQualityOptionsRef.value = [];

    const playbackInfo = await client.getPlaybackInfo(itemId);
    playbackInfoRef.value = playbackInfo;

    url.value = playbackInfo.streamUrl;

    void loadHlsVariants(url.value);

    if (mediaId) {
      try {
        detail.value = await client.getItem(mediaId);
        if (detail.value.type === 'Series') {
          seasonLoading.value = true;
          seasonError.value = undefined;
          try {
            const res = await client.getItemSeason(mediaId);
            season.value = res;
            const firstSeasonId = res.items?.[0]?.id || '';
            selectedSeasonId.value = firstSeasonId;
            if (firstSeasonId) {
              await loadEpisodesBySeasonId(firstSeasonId);
            }
            void (async () => {
              const ids = (res.items || []).map((s) => s.id).filter(Boolean);
              for (const id of ids) {
                if (!episodeCacheMap[id]?.length) {
                  await loadEpisodesBySeasonId(id);
                }
              }
            })();
          } catch (e) {
            MessageUtil.error("初始化剧集信息失败", e);
          } finally {
            seasonLoading.value = false;
          }
        }
      } catch (e) {
        MessageUtil.error("加载详情失败", e);
      }
    }
  });

  const windows = await getAllWindows();
  for (const win of windows) {
    if (win.label === 'main') {
      await win.emit('complete');
      break;
    }
  }

  const unlistenDestroyed = await current.listen('tauri://destroyed', async () => {
    await reportStopped();
    resetReportContext();
    clientRef.value = undefined;
    itemIdRef.value = '';
  });

  onUnmounted(() => {
    unlistenInit();
    unlistenDestroyed();
  });
});
</script>

<style lang="less">
html,
body {
  background: transparent;
}

.player-root {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.quality-control {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 60;
}

.quality-panel {
  padding: 8px 12px;
}
</style>
