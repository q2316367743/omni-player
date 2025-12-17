<template>

</template>
<script lang="ts" setup>
// https://crates.io/crates/tauri-plugin-libmpv
import {
  command,
  destroy,
  init,
  type MpvConfig,
  type MpvObservableProperty,
  observeProperties,
} from 'tauri-plugin-libmpv-api';
import {getAllWindows, getCurrentWindow} from "@tauri-apps/api/window";
import type {WindowPayload} from "@/lib/windows.ts";
import {fetchMediaClient} from "@/store";

// Properties to observe
// Tip: The optional third element, 'none', signals to TypeScript that the property's value may be null
// (e.g., when a file is not loaded), ensuring type safety in the callback function.
const OBSERVED_PROPERTIES = [
  ['pause', 'flag'],
  ['time-pos', 'double', 'none'],
  ['duration', 'double', 'none'],
  ['filename', 'string', 'none'],
] as const satisfies MpvObservableProperty[]


onMounted(async () => {
  // 初始化mpv
  // Initialize mpv
  // mpv configuration
  const mpvConfig: MpvConfig = {
    initialOptions: {
      'vo': 'gpu-next',
      'hwdec': 'auto-safe',
      'keep-open': 'yes',
      'force-window': 'yes',
    },
    observedProperties: OBSERVED_PROPERTIES,
  }
  try {
    await init(mpvConfig)
    console.log('mpv initialization completed successfully!')
  } catch (error) {
    console.error('mpv initialization failed:', error)
  }
// Observe properties
  const unlisten = await observeProperties(
    OBSERVED_PROPERTIES,
    ({name, data}) => {
      switch (name) {
        case 'pause':
          // data type: boolean
          console.log('Playback paused state:', data)
          break
        case 'time-pos':
          // data type: number | null
          console.log('Current time position:', data)
          break
        case 'duration':
          // data type: number | null
          console.log('Duration:', data)
          break
        case 'filename':
          // data type: string | null
          console.log('Current playing file:', data)
          break
      }
    })
  // 设置监听初始化事件
  const current = getCurrentWindow();
  await current.listen<WindowPayload>("init", async ({payload}) => {
    const {mediaId, serverId} = payload;
    // 获取实例
    const client = await fetchMediaClient(serverId);
    // 获取播放信息
    const playbackInfo = await client.getPlaybackInfo(mediaId);
    // Load and play a file
    await command('loadfile', [playbackInfo.streamUrl])
  });
  // 发送初始化完成事件
  const windows = await getAllWindows()
  for (let win of windows) {
    if (win.label === 'main') {
      // 推送初始化完成事件
      await win.emit("complete");
      return;
    }
  }
  // 监听窗口关闭，销毁mpv
  await current.listen("tauri://destroyed", async () => {
    // 取消监听
    unlisten();
    // 销毁mpv
    await destroy()
  })
})


// Set property
// await setProperty('volume', 75)

// Get property
// const volume = await getProperty('volume', 'int64')

</script>
<style lang="less">
/* In your main CSS file */
html,
body {
  background: transparent;
}
</style>
