<template>
  <div class="art-player" ref="art-player"></div>
</template>
<script lang="ts" setup>
import Artplayer from 'artplayer';
import {onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch} from 'vue';
import {playFlv, playM3u8} from "../../../lib/artplayer";

const props = withDefaults(defineProps<{
  url: string;
  type?: string;
  subtitleUrls?: string[];
}>(), {
  type: undefined,
  subtitleUrls: () => [],
});
type PlaybackState = 'playing' | 'paused' | 'stopped';
type PlaybackPayload = { state: PlaybackState; positionMs: number; durationMs?: number };

const emit = defineEmits<{
  (e: 'next'): void;
  (e: 'playback', payload: PlaybackPayload): void;
  (e: 'info'): void;
}>();
const art = shallowRef<Artplayer>();
const videoRef = useTemplateRef<HTMLDivElement>('art-player');

const selectedSubtitleUrl = ref<string>('');

const reportIntervalMs = 5000;
let lastReportAt = 0;
let lastKey = '';

function inferSubtitleType(u: string): 'vtt' | 'srt' | 'ass' | undefined {
  let pathname = '';
  try {
    pathname = new URL(u).pathname.toLowerCase();
  } catch {
    pathname = u.toLowerCase().split('?')[0] ?? '';
  }
  if (pathname.endsWith('.vtt')) return 'vtt';
  if (pathname.endsWith('.srt')) return 'srt';
  if (pathname.endsWith('.ass')) return 'ass';
  return undefined;
}

function inferSubtitleLabel(u: string, index: number): string {
  try {
    const { pathname } = new URL(u);
    const last = pathname.split('/').filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {
    const base = (u.split('?')[0] ?? '').split('/').filter(Boolean).pop();
    if (base) return base;
  }
  return `字幕${index + 1}`;
}

function buildSubtitleSetting() {
  const urls = props.subtitleUrls ?? [];
  if (!urls.length) return undefined;

  const selector = [
    { html: '关闭', url: '', default: selectedSubtitleUrl.value === '' },
    ...urls.map((u, idx) => ({
      html: inferSubtitleLabel(u, idx),
      url: u,
      default: u === selectedSubtitleUrl.value,
    })),
  ];

  return {
    name: 'subtitle',
    html: '字幕',
    selector,
    onSelect(this: Artplayer, item: { url?: string; html: string | HTMLElement }) {
      const nextUrl = item.url || '';
      selectedSubtitleUrl.value = nextUrl;

      if (!nextUrl) {
        this.subtitle.url = '';
        return;
      }

      const type = inferSubtitleType(nextUrl);
      void this.subtitle.switch(nextUrl, type ? { type } : undefined).catch(() => undefined);
    },
  } as const;
}

function syncSubtitleSetting() {
  const a = art.value;
  if (!a) return;

  const hasSubtitleSetting = a.setting.option.some(o => (o as { name?: string }).name === 'subtitle');
  const setting = buildSubtitleSetting();
  if (!setting) {
    if (hasSubtitleSetting) {
      try {
        a.setting.remove('subtitle');
      } catch {
        void 0;
      }
    }
    return;
  }

  if (!hasSubtitleSetting) a.setting.add(setting);
  else a.setting.update(setting);
}

function applySelectedSubtitle() {
  const a = art.value;
  if (!a) return;

  const nextUrl = selectedSubtitleUrl.value;
  if (!nextUrl) {
    a.subtitle.url = '';
    return;
  }

  const type = inferSubtitleType(nextUrl);
  void a.subtitle.switch(nextUrl, type ? { type } : undefined).catch(() => undefined);
}

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
    subtitle: {
      url: selectedSubtitleUrl.value,
    },

    controls: [
      {
        position: 'right',
        html: '<svg t="1766212041318" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7314" width="32" height="32"><path d="M473.173333 220.586667a35.84 35.84 0 1 0 35.84-35.84 35.84 35.84 0 0 0-35.84 35.84z m157.013334 485.12h-85.333334V355.413333a35.84 35.84 0 0 0-35.84-35.84H413.013333a35.84 35.84 0 1 0 0 72.106667h60.16v314.026667h-85.333333a35.84 35.84 0 1 0 0 72.106666h242.346667a35.84 35.84 0 1 0 0-72.106666z m192.853333 117.333333A439.893333 439.893333 0 1 1 341.333333 106.666667a439.893333 439.893333 0 0 1 481.706667 716.373333zM512 0a512 512 0 1 0 512 512A512 512 0 0 0 512 0z" fill="#5E5C5C" p-id="7315"></path></svg>',
        index: 1,
        click() {
          emit('info')
        },
      },
    ],
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    screenshot: true,
    fullscreen: true,
    fullscreenWeb: true,
    setting: true,
  });
  syncSubtitleSetting();
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
  applySelectedSubtitle();
  await art.value.play();
})
watch(() => props.type, type => {
  if (!art.value || !type) return;
  art.value.type = type;
})
watch(() => props.subtitleUrls, (next) => {
  const urls = next ?? [];
  if (selectedSubtitleUrl.value && !urls.includes(selectedSubtitleUrl.value)) {
    selectedSubtitleUrl.value = '';
    applySelectedSubtitle();
  }
  syncSubtitleSetting();
}, { deep: true })

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
