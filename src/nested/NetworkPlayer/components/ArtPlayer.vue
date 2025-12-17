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
const emit = defineEmits(['next']);
const art = shallowRef<Artplayer>();
const videoRef = useTemplateRef('art-player');


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
  art.value.on('video:ended', () => {
    emit('next');
  })
  art.value.play();
});
watch(() => props.url, async url => {
  if (!art.value) return;
  await art.value.switchUrl(url);
  await art.value.play();
})
watch(() => props.type, type => {
  if (!art.value || !type) return;
  art.value.type = type;
})
</script>
<style scoped lang="less">
.art-player {
  width: 100%;
  height: 100%;
}
</style>
