<template>
  <div class="video-container">
    <art-player :url="url" :type="type" v-if="status === 'artplayer'" @next="$emit('next')"/>
    <mpv-player :url="url" v-else-if="status === 'mpv'" @next="$emit('next')"/>
    <iframe v-else-if="status === 'iframe'" :src="url" class="video-iframe" frameborder="0"/>
    <loading-result v-else-if="status === 'loading'" title="正在加载中"/>
    <empty-result v-else-if="status === 'unknow'" title="未知视频类型"/>
  </div>
</template>
<script lang="ts" setup>
import ArtPlayer from "@/nested/NetworkPlayer/components/ArtPlayer.vue";
import {useGlobalSettingStore} from "@/store/GlobalSettingStore.ts";

const props = defineProps({
  url: {
    type: String,
    required: true
  }
});
defineEmits(['next']);
const status = ref<'loading' | 'unknow'  | 'iframe'| 'artplayer' | "mpv">('loading');
const type = ref('mp4');

const {playerModeType} = useGlobalSettingStore()

function onPlay(url: string) {
  if (!url) return;
  const u = new URL(url);
  const {pathname} = u;
  if (pathname.endsWith('.m3u8')) {
    type.value = 'm3u8';
  } else if (pathname.endsWith('.flv')) {
    type.value = 'flv';
  } else if (pathname.endsWith('.mp4') || pathname.endsWith('.mkv')) {
    type.value = 'mp4';
  } else {
    // 默认
    status.value = 'iframe';
    return;
  }
  if (playerModeType === 'h5') status.value = 'artplayer';
  else status.value = 'mpv';
}


onMounted(() => {
  onPlay(props.url);
});
watch(() => props.url, url => onPlay(url));
</script>
<style scoped lang="less">
.video-container {
  width: 100%;
  height: 100%;
  position: relative;

  .video-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
}
</style>
