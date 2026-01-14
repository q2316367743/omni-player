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
import {fetchNetworkClient} from "@/store";
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";

const props = defineProps({
  serverId: {
    type: String,
    required: true
  },
  item: {
    type: Object as PropType<NetworkListItem>,
    required: true
  }
});

const detail = shallowRef<NetworkDetail>();
const plugin = shallowRef<INetworkServer>();

onMounted(async () => {
  const {serverId, item} = props;
  plugin.value = await fetchNetworkClient(serverId);
  detail.value = await plugin.value.getDetail(item!);
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
