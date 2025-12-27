<template>
  <div class="player-root">
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
      :type="type"
      :subtitle-urls="subtitleUrls"
      v-if="status === 'artplayer'"
      @next="$emit('next')"
      @playback="handlePlayback"
      @info="openDetail"
    />
    <t-loading v-else text="正在加载中"/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, shallowRef} from 'vue';
import {getAllWindows, getCurrentWindow} from '@tauri-apps/api/window';
import type {WindowPayload} from '@/lib/windows.ts';
import {fetchMediaClient} from '@/store';
import type {IMediaServer} from "@/modules/media/IMediaServer.ts";
import type {MediaPlaybackReport, MediaPlaybackState} from "@/modules/media/types/playback/MediaPlaybackReport.ts";
import type {MediaPlaybackInfo} from "@/modules/media/types/playback/MediaPlaybackInfo.ts";
import {openDetailDrawer} from './detailDrawer';
import ArtPlayer from "../NetworkPlayer/components/ArtPlayer.vue";

const url = ref('')

const clientRef = shallowRef<IMediaServer>();
const itemIdRef = ref<string>('');
const playbackInfoRef = shallowRef<MediaPlaybackInfo>();
const playbackStartTimeRef = ref<number>();
const lastPlaybackRef = shallowRef<{ state: MediaPlaybackState; positionMs: number; durationMs?: number }>();
let windowPayload: WindowPayload | null = null;

function openDetail() {
  if (!clientRef.value) return;
  if (!windowPayload) return;
  openDetailDrawer(clientRef.value, windowPayload);
}

const status = ref<'artplayer' | "loading">('loading');
const type = ref('mp4');

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
    type.value = inferTypeFromUrl(option.url, 'm3u8');
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
  type.value = inferTypeFromUrl(url.value, playbackInfo.container);
  void loadHlsVariants(url.value);
}

onMounted(async () => {

  const current = getCurrentWindow();
  status.value = 'artplayer';

  const unlistenInit = await current.listen<WindowPayload>('init', async ({payload}) => {
    const {serverId, itemId} = payload;
    windowPayload = payload;

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

    type.value = inferTypeFromUrl(url.value, playbackInfo.container);
    void loadHlsVariants(url.value);


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

.t-drawer__body {
  padding: 0 !important;
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
