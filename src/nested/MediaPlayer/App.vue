<template>
  <art-player :url="url" v-if="status === 'artplayer'" @next="$emit('next')"/>
  <MpvPlayer :url="url">
    <t-button theme="primary" variant="text" shape="circle" @click="openDetail">
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
import type {MediaDetail} from '@/modules/media/types/detail/MediaDetail.ts';
import {openDetailDrawer} from './detailDrawer.tsx';
import {InfoCircleIcon} from "tdesign-icons-vue-next";
import ArtPlayer from "@/nested/NetworkPlayer/components/ArtPlayer.vue";
import {useGlobalSettingStore} from "@/store/GlobalSettingStore.ts";

const url = ref('')

const detail = ref<MediaDetail>();

function openDetail() {
  if (!detail.value) return;
  openDetailDrawer({
    detail: detail.value,
  });
}

const status = ref<'artplayer' | "mpv" | "loading">('loading');
const type = ref('mp4');

onMounted(async () => {

  const current = getCurrentWindow();
  const {playerModeType} = useGlobalSettingStore()
  if (playerModeType === 'h5') status.value = 'artplayer';
  else status.value = 'mpv';

  await current.listen<WindowPayload>('init', async ({payload}) => {
    const {mediaId, serverId} = payload;
    const client = await fetchMediaClient(serverId);
    const playbackInfo = await client.getPlaybackInfo(mediaId);


    url.value = playbackInfo.streamUrl;

    if (url.value.endsWith('.m3u8')) {
      type.value = 'm3u8';
    } else if (url.value.endsWith('.flv')) {
      type.value = 'flv';
    } else if (url.value.endsWith('.mp4') || url.value.endsWith('.mkv')) {
      type.value = 'mp4';
    } else


    detail.value = await client.getItem(mediaId);
  });

  const windows = await getAllWindows();
  for (const win of windows) {
    if (win.label === 'main') {
      await win.emit('complete');
      break;
    }
  }

  await current.listen('tauri://destroyed', async () => {
  });
});
</script>

<style lang="less">
html,
body {
  background: transparent;
}
</style>
