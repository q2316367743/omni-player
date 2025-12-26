<template>
  <div class="nav-group">
    <div class="group-title">
      <span>网络资源</span>
      <t-button class="ml-auto" theme="primary" size="small" variant="text" shape="square"
                @click="openSearchModelWrap()">
        <template #icon>
          <search-icon/>
        </template>
      </t-button>
      <t-button class="ml-4px" theme="primary" size="small" variant="text" shape="square"
                @click="openNetworkServerEdit()">
        <template #icon>
          <add-icon/>
        </template>
      </t-button>
    </div>
    <div v-for="network in networks" :key="network.id"
         :class="{active: activeKey === `/network/${network.id}`, 'nav-item' : true}"
         @click="jumpNetwork(network.id)" @contextmenu="openNetworkContextmenu(network, $event)">
      <div class="nav-item-content">
        <internet-icon :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]'
                       :stroke-width="2"/>
        <span class="nav-text">{{ network.name }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {openNetworkContextmenu, openNetworkServerEdit} from "@/layouts/AppSide/func/NetworkServerEdit.tsx";
import {AddIcon, InternetIcon, SearchIcon} from "tdesign-icons-vue-next";
import {useNetworkServerStore} from "@/store";
import {openSearchModel} from "@/util/model/SearchUtil.tsx";

const router = useRouter();

defineProps({
  activeKey: String
});


const networks = computed(() => {
  return [...useNetworkServerStore().servers].sort((a, b) => {
    const groupDiff = a.group.localeCompare(b.group);
    if (groupDiff !== 0) return groupDiff;
    const diff = a.sequence - b.sequence;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
});


const jumpNetwork = (id: string) => router.push(`/network/${id}/home`);

const openSearchModelWrap = () => {
  openSearchModel()
}
</script>
<style scoped lang="less">

</style>
