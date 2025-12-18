<template>
  <div
    class="fixed inset-0 select-none"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @dblclick="toggleFullscreen"
  >
    <div class="absolute inset-0">
      <!-- 遮罩层 -->
      <div
        v-if="controlsVisible"
        class="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-black/55 via-black/20 to-transparent"
      />
      <div
        v-if="controlsVisible"
        class="absolute inset-x-0 bottom-0 h-36 pointer-events-none bg-gradient-to-t from-black/65 via-black/25 to-transparent"
      />
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-3"
    >
      <div v-show="controlsVisible" class="absolute inset-x-0 bottom-0 z-50 pb-4 px-4">
        <div
          class="mx-auto max-w-5xl rounded-2xl border border-white/15 bg-black/45 backdrop-blur-md shadow-2xl px-3 py-3"
          @mouseenter="setHovering(true)"
          @mouseleave="setHovering(false)"
        >
          <div class="flex items-center gap-2">
            <t-tooltip :content="paused ? '播放' : '暂停'" placement="top">
              <t-button theme="primary" variant="text" shape="circle" @click="togglePlay">
                <t-icon :name="paused ? 'play' : 'pause'"/>
              </t-button>
            </t-tooltip>

            <t-tooltip content="后退 10 秒" placement="top">
              <t-button theme="primary" variant="text" shape="circle" @click="seekRelative(-10)">
                <t-icon name="rollback"/>
              </t-button>
            </t-tooltip>

            <t-tooltip content="前进 10 秒" placement="top">
              <t-button theme="primary" variant="text" shape="circle" @click="seekRelative(10)">
                <t-icon name="rollfront"/>
              </t-button>
            </t-tooltip>

            <div class="min-w-0 flex-1 flex items-center gap-3 pl-1">
              <div class="shrink-0 text-xs text-white/90 font-mono tabular-nums">
                {{ timeText }} / {{ durationText }}
              </div>
              <t-slider
                :value="progressDraft"
                :min="0"
                :max="100"
                :step="0.1"
                :disabled="!canSeek"
                :tooltip-props="{ placement: 'top' }"
                @update:model-value="setProgress"
                @pointerdown="startSeeking"
                @change-end="seekCommit($event)"
              />
            </div>

            <div class="flex items-center gap-1 pl-2">
              <t-tooltip :content="muted ? '取消静音' : '静音'" placement="top">
                <t-button theme="primary" variant="text" shape="circle" @click="toggleMute">
                  <t-icon :name="muted ? 'sound-mute' : 'sound'"/>
                </t-button>
              </t-tooltip>

              <div class="w-28">
                <t-slider
                  :value="volumeDraft"
                  :min="0"
                  :max="100"
                  :step="1"
                  :tooltip-props="{ placement: 'top' }"
                  @update:model-value="setVolume"
                  @change-end="volumeCommit($event)"
                />
              </div>


              <t-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="top">
                <t-button theme="primary" variant="text" shape="circle" @click="toggleFullscreen">
                  <t-icon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"/>
                </t-button>
              </t-tooltip>

              <!-- 此处做插槽 -->
              <slot/>

              <t-tooltip content="关闭" placement="top">
                <t-button theme="primary" variant="text" shape="circle" @click="closeWindow">
                  <t-icon name="close"/>
                </t-button>
              </t-tooltip>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 全屏播放控制 -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-show="paused && canTogglePlay" class="absolute inset-0 z-40 flex items-center justify-center">
        <t-button
          theme="primary"
          shape="circle"
          size="large"
          class="shadow-2xl"
          @mouseenter="setHovering(true)"
          @mouseleave="setHovering(false)"
          @click="togglePlay"
        >
          <template #icon>
            <t-icon name="play" class="text-xl"/>
          </template>
        </t-button>
      </div>
    </transition>
  </div>
</template>
<script lang="ts" setup>
import {
  command,
  destroy,
  getProperty,
  init,
  listenEvents,
  type MpvConfig,
  type MpvObservableProperty,
  observeProperties,
  setProperty,
} from 'tauri-plugin-libmpv-api';
import {getCurrentWindow} from '@tauri-apps/api/window';
import MessageUtil from '@/util/model/MessageUtil.ts';

const url = defineModel({
  type: String,
  default: ''
})
const emit = defineEmits(['next']);

const OBSERVED_PROPERTIES = [
  ['pause', 'flag'],
  ['time-pos', 'double', 'none'],
  ['duration', 'double', 'none'],
  ['volume', 'double'],
  ['mute', 'flag'],
  ['filename', 'string', 'none'],
] as const satisfies MpvObservableProperty[];

const mpvReady = ref(false);

const fileLoaded = ref(false);
const paused = ref(true);
const timePos = ref<number | null>(null);
const duration = ref<number | null>(null);
const filename = ref<string | null>(null);

const volume = ref(100);
const volumeDraft = ref(100);
const muted = ref(false);

const controlsVisible = ref(true);
const hoveringControls = ref(false);
let hideTimer: ReturnType<typeof window.setTimeout> | undefined = undefined;

const isFullscreen = ref(false);
const progressDraft = ref(0);
const seeking = ref(false);

const canSeek = computed(() => mpvReady.value && fileLoaded.value && (duration.value ?? 0) > 0);
const canTogglePlay = computed(() => mpvReady.value && fileLoaded.value);

const timeText = computed(() => formatTime(timePos.value ?? 0));
const durationText = computed(() => formatTime(duration.value ?? 0));

watch([timePos, duration, seeking], () => {
  if (seeking.value) return;
  if (!duration.value || duration.value <= 0 || timePos.value === null) {
    progressDraft.value = 0;
    return;
  }
  const p = (timePos.value / duration.value) * 100;
  progressDraft.value = clamp(p, 0, 100);
});

watch(volume, (v) => {
  if (Number.isFinite(v)) volumeDraft.value = clamp(v, 0, 100);
});

watch(hoveringControls, (v) => {
  if (v) {
    clearHideTimer();
    return;
  }
  showControls();
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function clearHideTimer() {
  if (hideTimer) window.clearTimeout(hideTimer);
  hideTimer = undefined;
}

function scheduleHide() {
  clearHideTimer();
  if (hoveringControls.value) return;
  if (paused.value) return;
  hideTimer = setTimeout(() => {
    if (!hoveringControls.value && !paused.value) controlsVisible.value = false;
  }, 1500);
}

function showControls() {
  controlsVisible.value = true;
  scheduleHide();
}

function handleMouseMove() {
  controlsVisible.value = true;
  scheduleHide();
}

function handleMouseLeave() {
  if (paused.value) return;
  if (hoveringControls.value) return;
  controlsVisible.value = false;
  clearHideTimer();
}

async function togglePlay() {
  if (!canTogglePlay.value) return;
  const nextPaused = !paused.value;
  try {
    await setProperty('pause', nextPaused);
  } catch (error) {
    await command('set', ['pause', nextPaused]);
  }
  const p = await getProperty('pause', 'flag').catch(() => null);
  if (typeof p === 'boolean') paused.value = p;
  showControls();
}

async function seekRelative(deltaSeconds: number) {
  if (!canSeek.value) return;
  await command('seek', [deltaSeconds, 'relative']);
  showControls();
}

function startSeeking() {
  if (!canSeek.value) return;
  seeking.value = true;
  clearHideTimer();
}

async function seekCommit(v: number | number[]) {
  if (!canSeek.value) return;
  try {
    const percent = Array.isArray(v) ? v[0] : v;
    const target = (clamp(percent ?? 0, 0, 100) / 100) * (duration.value || 0);
    await command('seek', [target, 'absolute']);
    showControls();
  } finally {
    seeking.value = false;
  }
}

async function toggleMute() {
  if (!mpvReady.value) return;
  const nextMuted = !muted.value;
  try {
    await setProperty('mute', nextMuted);
  } catch (error) {
    await command('set', ['mute', nextMuted]);
  }
  const m = await getProperty('mute', 'flag').catch(() => null);
  if (typeof m === 'boolean') muted.value = m;
  showControls();
}

async function volumeCommit(v: number | number[]) {
  if (!mpvReady.value) return;
  const next = Array.isArray(v) ? v[0] : v;
  const value = Math.round(clamp(next ?? 0, 0, 100));
  try {
    await setProperty('volume', value);
  } catch (error) {
    await command('set', ['volume', value]);
  }
  if (value > 0 && muted.value) {
    try {
      await setProperty('mute', false);
    } catch (error) {
      await command('set', ['mute', false]);
    }
  }
  showControls();
}

async function toggleFullscreen() {
  const current = getCurrentWindow();
  const next = !isFullscreen.value;
  await current.setFullscreen(next);
  isFullscreen.value = await current.isFullscreen();
  showControls();
}

async function closeWindow() {
  await getCurrentWindow().close();
}

function toNumber(v: number | number[]) {
  return Array.isArray(v) ? (v[0] ?? 0) : v;
}

function setHovering(v: boolean) {
  if (hoveringControls.value === v) return;
  hoveringControls.value = v;
}

function setProgress(v: number | number[]) {
  progressDraft.value = toNumber(v);
}

function setVolume(v: number | number[]) {
  volumeDraft.value = toNumber(v);
}

let unobserve: (() => void) | undefined;
let unlisten: (() => void) | undefined;


onMounted(async () => {
  const mpvConfig: MpvConfig = {
    initialOptions: {
      vo: 'gpu-next',
      hwdec: 'auto-safe',
      'keep-open': 'yes',
      'force-window': 'yes',
    },
    observedProperties: OBSERVED_PROPERTIES,
  };

  try {
    await init(mpvConfig);
    mpvReady.value = true;
    fileLoaded.value = false;
    controlsVisible.value = true;
  } catch (error) {
    MessageUtil.error('播放器初始化失败', error);
  }

  // 监听url变化
  watch(url, val => {
    if (!val) {
      command("stop")
      return;
    }
    command('loadfile', [val, 'replace']);
  }, {immediate: true})

  // 是否全屏
  const current = getCurrentWindow();
  isFullscreen.value = await current.isFullscreen();

  // 监听进度条拖动
  useEventListener(window, 'pointerup', () => {
    if (!seeking.value) return;
    seeking.value = false;
    void seekCommit(progressDraft.value);
  });

  // 每300ms获取一次mpv播放器状态
  useIntervalFn(async () => {
    if (!mpvReady.value) return;
    if (!fileLoaded.value) return;

    const [p, t, d, v, m, f] = await Promise.all([
      getProperty('pause', 'flag').catch(() => null),
      getProperty('time-pos', 'double').catch(() => null),
      getProperty('duration', 'double').catch(() => null),
      getProperty('volume', 'double').catch(() => null),
      getProperty('mute', 'flag').catch(() => null),
      getProperty('filename', 'string').catch(() => null),
    ] as const);

    if (typeof d === 'number' || d === null) duration.value = d;
    if (typeof v === 'number') volume.value = v;
    if (typeof m === 'boolean') muted.value = m;
    if (typeof f === 'string' || f === null) filename.value = f;
    if (!seeking.value && (typeof t === 'number' || t === null)) timePos.value = t;

    if (typeof p === 'boolean') {
      const prev = paused.value;
      paused.value = p;
      if (prev !== paused.value) {
        if (paused.value) {
          controlsVisible.value = true;
          clearHideTimer();
        } else {
          scheduleHide();
        }
      }
    }
  }, 300, {immediate: true});

  // 状态监听
  try {
    unobserve = await observeProperties(OBSERVED_PROPERTIES, ({name, data}) => {
      switch (name) {
        case 'pause':
          if (typeof data !== 'boolean') break;
          paused.value = data;
          if (paused.value) {
            controlsVisible.value = true;
            clearHideTimer();
          } else {
            scheduleHide();
          }
          break;
        case 'time-pos':
          if (!seeking.value) timePos.value = data;
          break;
        case 'duration':
          duration.value = data;
          break;
        case 'volume':
          volume.value = data;
          break;
        case 'mute':
          muted.value = data;
          break;
        case 'filename':
          filename.value = data;
          break;
      }
    });
  } catch (error) {
    MessageUtil.error('播放器状态监听失败', error);
  }
  // 事件监听
  try {
    unlisten = await listenEvents((event) => {
      if (event.event === 'end-file') {
        const endEvent = event as import('tauri-plugin-libmpv-api').MpvEndFileEvent
        console.log('播放结束原因:', endEvent.reason)

        switch (endEvent.reason) {
          case 'eof':
            console.log('✅ 正常播放完毕')
            emit('next');
            break
          case 'error':
            MessageUtil.error('❌ 播放出错 (error code:' + endEvent.error + ')')
            break
          case 'stop':
            console.log('⏹ 用户手动停止')
            break
          default:
            MessageUtil.error('ℹ️ 其他结束原因:', endEvent.reason);
        }
      }
    })
  } catch (error) {
    MessageUtil.error('播放器事件监听失败', error);
  }

  // 键盘控制
  useEventListener(window, 'keydown', async (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === ' ' || key === 'k') {
      e.preventDefault();
      await togglePlay();
      return;
    }
    if (key === 'arrowleft') {
      e.preventDefault();
      await seekRelative(-5);
      return;
    }
    if (key === 'arrowright') {
      e.preventDefault();
      await seekRelative(5);
      return;
    }
    if (key === 'arrowup') {
      e.preventDefault();
      if (!mpvReady.value) return;
      await command('add', ['volume', 5]);
      showControls();
      return;
    }
    if (key === 'arrowdown') {
      e.preventDefault();
      if (!mpvReady.value) return;
      await command('add', ['volume', -5]);
      showControls();
      return;
    }
    if (key === 'm') {
      e.preventDefault();
      await toggleMute();
      return;
    }
    if (key === 'f') {
      e.preventDefault();
      await toggleFullscreen();
      return;
    }
  });

  fileLoaded.value = true;
  controlsVisible.value = true;

  const v = await getProperty('volume', 'double').catch(() => null);
  if (typeof v === 'number') volume.value = v;
  volumeDraft.value = volume.value;

  const m = await getProperty('mute', 'flag').catch(() => null);
  if (typeof m === 'boolean') muted.value = m;

  const p = await getProperty('pause', 'flag').catch(() => null);
  if (typeof p === 'boolean') paused.value = p;

  if (paused.value === false) scheduleHide();

  // 窗口关闭后释放资源
  await current.listen('tauri://destroyed', async () => {
    unobserve?.();
    unlisten?.();
    await destroy();
  });
})
;
</script>
<style scoped lang="less">

</style>
