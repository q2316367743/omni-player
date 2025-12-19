<template>
  <div class="art-player" ref="art-player"></div>
</template>
<script lang="ts" setup>
import Artplayer from 'artplayer';
import {playFlv, playM3u8} from "@/lib/artplayer.ts";

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: false
  }
});
type PlaybackState = 'playing' | 'paused' | 'stopped';
type PlaybackPayload = { state: PlaybackState; positionMs: number; durationMs?: number };

const emit = defineEmits<{
  (e: 'next'): void;
  (e: 'playback', payload: PlaybackPayload): void;
}>();
const art = shallowRef<Artplayer>();
const videoRef = useTemplateRef('art-player');

const reportIntervalMs = 5000;
let lastReportAt = 0;
let lastKey = '';

function getSnapshot(): { positionMs: number; durationMs?: number } {
  const a = art.value;
  if (!a) return {positionMs: 0};
  const positionMs = Math.max(0, Math.floor((a.currentTime) * 1000));
  const durationMs = Number.isFinite(a.duration) && a.duration > 0
    ? Math.floor(a.duration * 1000)
    : undefined;
  return {positionMs, durationMs};
}

function emitPlayback(state: PlaybackState, force = false) {
  const {positionMs, durationMs} = getSnapshot();
  const key = `${state}:${Math.floor(positionMs / 1000)}:${typeof durationMs === 'number' ? Math.floor(durationMs / 1000) : ''}`;
  const now = Date.now();

  if (!force) {
    if (state === 'playing' && now - lastReportAt < reportIntervalMs) return;
    if (key === lastKey) return;
  }

  lastReportAt = now;
  lastKey = key;
  emit('playback', {state, positionMs, durationMs});
}

onMounted(() => {
  if (!videoRef.value) return;
  art.value = new Artplayer({
    container: videoRef.value,
    url: props.url,
    type: props.type,
    customType: {
      flv: playFlv,
      m3u8: playM3u8
    },
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    screenshot: true,
    fullscreen: true,
    fullscreenWeb: true,
    setting: true,
  });
  art.value.on('video:play', () => emitPlayback('playing', true));
  art.value.on('video:pause', () => emitPlayback('paused', true));
  art.value.on('video:timeupdate', () => {
    const a = art.value;
    if (!a) return;
    emitPlayback(a.playing ? 'playing' : 'paused');
  });
  art.value.on('video:ended', () => {
    emitPlayback('stopped', true);
    emit('next');
  })
  art.value.play();
});
watch(() => props.url, async url => {
  if (!art.value) return;
  emitPlayback('stopped', true);
  lastReportAt = 0;
  lastKey = '';
  await art.value.switchUrl(url);
  await art.value.play();
})
watch(() => props.type, type => {
  if (!art.value || !type) return;
  art.value.type = type;
})

onUnmounted(() => {
  emitPlayback('stopped', true);
  art.value?.destroy?.();
  art.value = undefined;
})
</script>
<style scoped lang="less">
.art-player {
  width: 100%;
  height: 100%;
}
</style>
