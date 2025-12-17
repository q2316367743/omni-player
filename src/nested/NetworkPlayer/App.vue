<template>
  <div class="main">
    <player v-if="detail && plugin" :default-network="detail" :plugin="plugin"/>
    <loading-result v-else title="正在加载中"/>
  </div>
</template>
<script lang="ts" setup>
import Player from "@/nested/NetworkPlayer/components/Player.vue";
import type {NetworkDetail} from "@/modules/network/types/NetworkDetail.ts";
import type {INetworkServer} from "@/modules/network/INetworkServer.ts";
import {createNetworkServer} from "@/modules/network/factory.ts";
import {getAllWindows, getCurrentWindow} from "@tauri-apps/api/window";

const detail = shallowRef<NetworkDetail>();
const plugin = shallowRef<INetworkServer>();

onMounted(async () => {
  await getCurrentWindow().listen<any>("init", ({payload}) => {
    const {source, video} = payload;
    plugin.value = createNetworkServer(source);
    detail.value = video;
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
  color: var(--td-text-color-primary);
  background-color: var(--td-bg-color-container);
}
</style>
