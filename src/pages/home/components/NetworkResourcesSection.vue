<template>
  <div class="resource-section">
    <div class="resource-header">
      <h3 class="resource-title">
        <internet-icon class="title-icon"/>
        网络资源
      </h3>
      <div class="flex gap-4px">
        <t-tooltip content="导入">
          <t-button theme="primary" variant="text" shape="square"
                    @click="importNetwork()">
            <template #icon>
              <file-import-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-tooltip content="导出">
          <t-button theme="primary" variant="text" shape="square"
                    @click="exportNetwork()">
            <template #icon>
              <file-export-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-tooltip content="聚合搜索">
          <t-button theme="primary" variant="text" shape="square"
                    @click="openSearchModelWrap()">
            <template #icon>
              <search-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-button theme="primary" variant="text" shape="square"
                  @click="openNetworkServerEdit()">
          <template #icon>
            <add-icon/>
          </template>
        </t-button>
      </div>
    </div>
    <div class="resource-grid">
      <div v-for="network in networks" :key="network.id" class="resource-card" @click="jumpNetwork(network.id)"
           @contextmenu="handleNetworkContextmenu(network, $event)">
        <div class="resource-icon network">
          <internet-icon/>
        </div>
        <div class="resource-info">
          <div class="resource-name">{{ network.name }}</div>
          <div class="resource-type">{{ network.group || '未分组' }}</div>
        </div>
      </div>
      <div v-if="networks.length === 0" class="empty-state">
        <div class="empty-icon">
          <internet-icon/>
        </div>
        <div class="empty-text">暂无网络资源</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useNetworkServerStore} from "@/store";
import {InternetIcon, AddIcon, SearchIcon, FileImportIcon, FileExportIcon} from "tdesign-icons-vue-next";
import type {NetworkServer} from "@/entity/NetworkServer.ts";
import {openNetworkContextmenu, openNetworkServerEdit} from "@/pages/home/func/NetworkServerEdit.tsx";
import {openSearchModel} from "@/util/model/SearchUtil.tsx";
import {exportNetwork, importNetwork} from "@/pages/home/func/NetworkExtra.tsx";

const router = useRouter();

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

const handleNetworkContextmenu = (network: NetworkServer, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  openNetworkContextmenu(network, e);
};

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
@import "../home-index.less";
</style>
