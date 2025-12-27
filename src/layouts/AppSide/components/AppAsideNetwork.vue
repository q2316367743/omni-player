<template>
  <div class="nav-group">
    <div class="group-title justify-between">
      <div class="flex items-center gap-4px" @click="toggleGroup">
        <span class="toggle-icon">
          <minus-icon v-if="groupExpanded"/>
          <add-icon v-else/>
        </span>
        <span class="group-title-text">网络资源</span>
      </div>
      <div class="flex gap-4px">
        <t-button theme="primary" size="small" variant="text" shape="square"
                  @click="openSearchModelWrap()">
          <template #icon>
            <search-icon/>
          </template>
        </t-button>
        <t-button theme="primary" size="small" variant="text" shape="square"
                  @click="openNetworkServerEdit()">
          <template #icon>
            <add-icon/>
          </template>
        </t-button>
      </div>
    </div>
    <div v-show="groupExpanded" v-for="network in networks" :key="network.id"
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
import {AddIcon, MinusIcon} from "tdesign-icons-vue-next";
import {openNetworkContextmenu, openNetworkServerEdit} from "@/layouts/AppSide/func/NetworkServerEdit.tsx";
import {InternetIcon, SearchIcon} from "tdesign-icons-vue-next";
import {useNetworkServerStore} from "@/store";
import {openSearchModel} from "@/util/model/SearchUtil.tsx";
import {LocalName} from "@/global/LocalName.ts";

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

const groupExpanded = useLocalStorage(LocalName.APP_ASIDE_NETWORK_EXPANDED, true);

const toggleGroup = () => {
  groupExpanded.value = !groupExpanded.value;
};

const jumpNetwork = (id: string) => router.push(`/network/${id}/home`);

const openSearchModelWrap = () => {
  openSearchModel().then(keyword => {
    if (!keyword) return;
    router.push({
      path: '/network/aggregation',
      query: {
        keyword
      }
    })

  })
}
</script>
<style scoped lang="less">
.group-title {
  .toggle-icon {
    cursor: pointer;
    font-size: 12px;
    color: var(--td-text-color-secondary);
    transition: transform 0.2s;

    &:hover {
      color: var(--td-text-color-primary);
    }
  }
}
</style>
