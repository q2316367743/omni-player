<template>
  <art-player :url="url" :type="type" v-if="status === 'artplayer'" @next="$emit('next')" @playback="handlePlayback"/>
  <MpvPlayer :url="url" v-else @playback="handlePlayback">
    <t-button theme="primary" variant="text" shape="circle" @click="openDetail" class="shrink-0">
      <template #icon>
        <InfoCircleIcon/>
      </template>
    </t-button>
  </MpvPlayer>
</template>

<script setup lang="ts">
import {getAllWindows, getCurrentWindow} from '@tauri-apps/api/window';
import type {WindowPayload} from '@/lib/windows.ts';
import {fetchMediaClient} from '@/store';
import type {IMediaServer} from "@/modules/media/IMediaServer.ts";
import type {MediaPlaybackReport, MediaPlaybackState} from "@/modules/media/types/playback/MediaPlaybackReport.ts";
import {openDetailDrawer} from './detailDrawer.tsx';
import {InfoCircleIcon} from "tdesign-icons-vue-next";
import ArtPlayer from "@/nested/NetworkPlayer/components/ArtPlayer.vue";
import {useGlobalSettingStore} from "@/store/GlobalSettingStore.ts";

const url = ref('')

const clientRef = shallowRef<IMediaServer>();
const itemIdRef = ref<string>('');
const playbackStartTimeRef = ref<number>();
const lastPlaybackRef = shallowRef<{ state: MediaPlaybackState; positionMs: number; durationMs?: number }>();
let windowPayload: WindowPayload | null = null;

function openDetail() {
  if (!clientRef.value) return;
  if (!windowPayload) return;
  openDetailDrawer(clientRef.value, windowPayload);
}

const status = ref<'artplayer' | "mpv" | "loading">('loading');
const type = ref('mp4');

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

onMounted(async () => {

  const current = getCurrentWindow();
  const {playerModeType} = useGlobalSettingStore()
  if (playerModeType === 'h5') status.value = 'artplayer';
  else status.value = 'mpv';

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

    const playbackInfo = await client.getPlaybackInfo(itemId);

    url.value = playbackInfo.streamUrl;

    if (url.value.endsWith('.m3u8')) {
      type.value = 'm3u8';
    } else if (url.value.endsWith('.flv')) {
      type.value = 'flv';
    } else {
      type.value = 'mp4';
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
.t-drawer__body {
  padding: 0 !important;
}
</style>
