<template>
  <div class="nav-group">
    <div class="group-title justify-between">
      <div>订阅源</div>
      <div class="flex gap-4px">
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
    <div class="subscribe-tree">
      <SubscribeTreeNode 
        v-for="node in subscribeTree" 
        :key="node.id" 
        :node="node"
        :active-key="activeKey"
        @jump="jumpSubscribe"
        @contextmenu="openSubscribeContextmenuWrap"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {AddIcon, RefreshIcon} from "tdesign-icons-vue-next";
import {openSubscribeContextmenu, openSubscribeEdit} from "@/layouts/AppSide/func/SubscribeEdit.tsx";
import type {SubscribeItem} from "@/entity/subscribe";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";
import SubscribeTreeNode from "./SubscribeTreeNode.vue";

const router = useRouter();

defineProps({
  activeKey: String
});

const subscribeStore = useSubscribeStore();
const subscribeTree = computed(() => subscribeStore.subscribeTree);

const jumpSubscribe = (id: string) => router.push(`/subscribe/${id}/0`);
const openSubscribeEditWrap = () => openSubscribeEdit(subscribeStore.refresh);
const openSubscribeContextmenuWrap = (server: SubscribeItem, e: PointerEvent) => openSubscribeContextmenu(subscribeStore.refresh, server, e)
</script>
<style scoped lang="less">
.subscribe-tree {
  .tree-node {
    .folder-node {
      .folder-icon {
        margin-right: 4px;
        font-size: 10px;
        color: var(--td-text-color-secondary);
      }
    }
    
    .tree-children {
      .nav-item {
        padding-left: 16px;
      }
    }
  }
}
</style>
