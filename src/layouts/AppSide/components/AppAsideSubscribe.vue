<template>
  <div class="nav-group">
    <div class="group-title justify-between">
      <div class="flex items-center gap-4px" @click="toggleGroup">
        <span class="toggle-icon">
          <minus-icon v-if="groupExpanded"/>
          <add-icon v-else/>
        </span>
        <span class="group-title-text">订阅源</span>
      </div>
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
    <div v-show="groupExpanded" class="subscribe-tree">
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
import {AddIcon, MinusIcon, RefreshIcon} from "tdesign-icons-vue-next";
import {openSubscribeContextmenu, openSubscribeEdit} from "@/layouts/AppSide/func/SubscribeEdit.tsx";
import type {SubscribeItem} from "@/entity/subscribe";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";
import SubscribeTreeNode from "./SubscribeTreeNode.vue";
import {LocalName} from "@/global/LocalName.ts";

const router = useRouter();

defineProps({
  activeKey: String
});

const subscribeStore = useSubscribeStore();
const subscribeTree = computed(() => subscribeStore.subscribeTree);
const groupExpanded = useLocalStorage(LocalName.APP_ASIDE_SUBSCRIBE_EXPANDED, true);

const toggleGroup = () => {
  groupExpanded.value = !groupExpanded.value;
};

const jumpSubscribe = (id: string) => router.push(`/subscribe/${id}/0`);
const openSubscribeEditWrap = () => openSubscribeEdit(subscribeStore.refresh);
const openSubscribeContextmenuWrap = (server: SubscribeItem, e: PointerEvent) => openSubscribeContextmenu(subscribeStore.refresh, server, e)
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
