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
import {getAllWindows, getCurrentWindow} from "@tauri-apps/api/window";
import {fetchNetworkClient} from "@/store";
import type {WindowPayload} from "@/lib/windows.ts";

const detail = shallowRef<NetworkDetail>();
const plugin = shallowRef<INetworkServer>();

onMounted(async () => {
  await getCurrentWindow().listen<WindowPayload>("init", async ({payload}) => {
    const {serverId, item} = payload;
    console.log("init", payload)
    plugin.value = await fetchNetworkClient(serverId);
    detail.value = await plugin.value.getDetail(item!);
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
