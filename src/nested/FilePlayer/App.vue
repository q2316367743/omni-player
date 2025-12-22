<template>
  <div class="player-root">
    <art-player
      :url="url"
      :type="type"
      :subtitle-urls="subtitleUrls"
      v-if="status === 'artplayer'"
      @next="$emit('next')"
    />
    <MpvPlayer :url="url" v-else-if="status === 'mpv'" />
    <t-loading v-else text="正在加载中"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, shallowRef} from 'vue';
import {getAllWindows, getCurrentWindow} from '@tauri-apps/api/window';
import type {WindowPayload} from '@/lib/windows.ts';
import {useFileServerStore} from '@/store';
import type {IFileServer} from "@/modules/file/IFileServer.ts";
import ArtPlayer from "../NetworkPlayer/components/ArtPlayer.vue";
import MpvPlayer from "../../components/VideoPlayer/MpvPlayer.vue";
import {useGlobalSettingStore} from "@/store/GlobalSettingStore.ts";
import type {FileItem} from "@/modules/file/types/FileItem.ts";

const url = ref('')

const clientRef = shallowRef<IFileServer>();
const fileRef = shallowRef<FileItem>();
const subtitleUrls = ref<string[]>([]);

const status = ref<'artplayer' | "mpv" | "loading">('loading');
const type = ref('mp4');

function inferTypeFromUrl(nextUrl: string) {
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
  return 'mp4';
}

onMounted(async () => {
  const current = getCurrentWindow();
  const {playerModeType} = useGlobalSettingStore()
  if (playerModeType === 'h5') status.value = 'artplayer';
  else status.value = 'mpv';

  const unlistenInit = await current.listen<WindowPayload>('init', async ({payload}) => {
    const {serverId, itemId, file} = payload;

    const client = await useFileServerStore().getServerClient(serverId);
    clientRef.value = client;
    fileRef.value = file;
    
    // 获取视频播放地址
    let streamUrl = '';
    if (file) {
      streamUrl = await client.getPlayableUrl(file);
    } else {
      // 如果没有传递 file 对象，尝试构造一个最小化的 FileItem 或者报错
      // 这里假设 client.getPlayableUrl 只需要 path，构造一个临时对象
      // 注意：这取决于具体的 FileServer 实现。
      streamUrl = await client.getPlayableUrl({ 
        id: itemId, 
        path: itemId, 
        name: itemId, 
        basename: itemId, 
        extname: '', 
        isDirectory: false 
      });
    }
    
    url.value = streamUrl;
    type.value = inferTypeFromUrl(streamUrl);
    
    // 处理字幕
    subtitleUrls.value = [];
    if (file && file.subtitles && file.subtitles.length > 0) {
       const subs: string[] = [];
       for (const sub of file.subtitles) {
         if (sub.type !== 'danmu') continue;
         if (['srt', 'ass', 'vtt'].includes(sub.format || '')) {
             try {
                // 构造一个临时的 FileItem 来获取字幕 URL
                // 假设 getPlayableUrl 对字幕文件也有效
                const subUrl = await client.getPlayableUrl({
                    id: sub.path, // 假设 path 可以作为 id
                    path: sub.path,
                    name: sub.title || '',
                    basename: '',
                    extname: sub.format || '',
                    isDirectory: false
                });
                subs.push(subUrl);
             } catch (e) {
                 console.warn('Failed to get subtitle url:', sub, e);
             }
         }
       }
       subtitleUrls.value = subs;
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
    clientRef.value = undefined;
    fileRef.value = undefined;
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
</style>