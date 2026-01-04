<template>
  <media-player v-if="mediaId && itemId && serverId" :media-id="mediaId" :item-id="itemId" :server-id="serverId" />
</template>

<script setup lang="ts">
import {getAllWindows, getCurrentWindow} from '@tauri-apps/api/window';
import type {WindowPayload} from '@/lib/windows.ts';
import MediaPlayer from "@/nested/MediaPlayer/MediaPlayer.vue";

// serverId, itemId, mediaId
const serverId = ref<string>();
const itemId = ref<string>();
const mediaId = ref<string>();

const status = ref<'artplayer' | "loading">('loading');

onMounted(async () => {

  const current = getCurrentWindow();
  status.value = 'artplayer';

  const unlistenInit = await current.listen<WindowPayload>('init', async ({payload}) => {

    serverId.value = payload.serverId;
    itemId.value = payload.itemId;
    mediaId.value = payload.mediaId

  });

  const windows = await getAllWindows();
  for (const win of windows) {
    if (win.label === 'main') {
      await win.emit('complete');
      break;
    }
  }

  onUnmounted(() => {
    unlistenInit();
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
