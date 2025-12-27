<template>
  <div class="resource-section">
    <div class="resource-header">
      <h3 class="resource-title">
        <rss-icon class="title-icon"/>
        订阅源
      </h3>
      <div class="flex gap-4px">
        <t-tooltip content="从opml导入">
          <t-button theme="primary" size="small" variant="text" shape="square" @click="importSubscribe">
            <template #icon>
              <file-import-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-tooltip content="导出为opml">
          <t-button theme="primary" size="small" variant="text" shape="square" @click="exportSubscribe">
            <template #icon>
              <file-export-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-button theme="primary" size="small" variant="text" shape="square" @click="subscribeStore.refresh()">
          <template #icon>
            <refresh-icon/>
          </template>
        </t-button>
        <t-button theme="primary" size="small" variant="text" shape="square"
                  @click="openSubscribeEditWrap()">
          <template #icon>
            <add-icon/>
          </template>
        </t-button>
      </div>
    </div>
    <div class="subscribe-tree-wrapper">
      <subscribe-tree-view
        v-if="subscribeTree.length > 0"
        :nodes="subscribeTree"
        @jump="jumpSubscribe"
        @contextmenu="handleSubscribeContextmenu"
      />
      <div v-else class="empty-state">
        <div class="empty-icon">
          <rss-icon/>
        </div>
        <div class="empty-text">暂无订阅源</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {RssIcon, AddIcon, RefreshIcon, FileImportIcon, FileExportIcon} from "tdesign-icons-vue-next";
import type {SubscribeItem} from "@/entity/subscribe";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";
import {openSubscribeContextmenu, openSubscribeEdit} from "@/pages/home/func/SubscribeEdit.tsx";
import SubscribeTreeView from "./SubscribeTreeView.vue";
import {exportSubscribe, importSubscribe} from "@/pages/home/func/SubscribeExtra.tsx";

const router = useRouter();

const subscribeStore = useSubscribeStore();
const subscribeTree = computed(() => subscribeStore.subscribeTree);

const jumpSubscribe = (id: string) => router.push(`/subscribe/${id}/0`);

const handleSubscribeContextmenu = (subscribe: SubscribeItem, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  openSubscribeContextmenu(subscribeStore.refresh, subscribe, e);
};

const openSubscribeEditWrap = () => openSubscribeEdit(subscribeStore.refresh);
</script>

<style scoped lang="less">
@import "../home-index.less";
</style>
