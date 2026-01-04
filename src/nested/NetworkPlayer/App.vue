<template>
  <NetworkPlayer v-if="item && serverId" :server-id="serverId" :item="item"/>
</template>
<script lang="ts" setup>
import {getAllWindows, getCurrentWindow} from "@tauri-apps/api/window";
import type {WindowPayload} from "@/lib/windows.ts";
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";
import NetworkPlayer from "@/nested/NetworkPlayer/NetworkPlayer.vue";

const item = ref<NetworkListItem>();
const serverId = ref<string>();


onMounted(async () => {
  await getCurrentWindow().listen<WindowPayload>("init", async ({payload}) => {
    item.value = payload.item;
    serverId.value = payload.serverId;
  });
  const wins = await getAllWindows()
  for (let win of wins) {
    if (win.label === 'main') {
      await win.emit("complete");
      return;
    }
  }
})

</script>
<style lang="less">
#app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
