<template>
  <div class="tree-node" :style="{ paddingLeft: level * 16 + 'px' }">
    <div 
      :class="{
        'nav-item': true,
        'active': node.type === 'item' && activeKey === '/subscribe/' + node.id,
        'folder-node': node.type === 'folder',
        'item-node': node.type === 'item'
      }"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      <div class="nav-item-content">
        <template v-if="node.type === 'folder'">
          <span class="folder-icon">
            <chevron-down-icon v-if="expanded"/>
            <chevron-right-icon v-else />
          </span>
          <span class="nav-text">{{ node.name }}</span>
        </template>
        <template v-else>
          <t-image v-if="node.data?.icon" :src="node.data.icon" class="feed-icon-img" alt="" width="16px" height="16px">
            <template #error>
              <rss-icon class="nav-icon"/>
            </template>
          </t-image>
          <rss-icon v-else class="nav-icon"/>
          <span class="nav-text">{{ node.name }}</span>
        </template>
      </div>
      <span v-if="node.count" :class="node.type === 'folder' ? 'folder-count-badge' : 'item-count-badge'">{{ node.count }}</span>
    </div>
    <div v-if="node.type === 'folder' && expanded && node.children" class="tree-children">
      <SubscribeTreeNode 
        v-for="child in node.children" 
        :key="child.id" 
        :node="child"
        :active-key="activeKey"
        :level="level + 1"
        @jump="$emit('jump', $event)"
        @contextmenu="(data, e) => $emit('contextmenu', data, e)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ChevronDownIcon, ChevronRightIcon, RssIcon} from "tdesign-icons-vue-next";
import type {TreeNode} from "@/store/SubscribeStore.ts";

interface Props {
  node: TreeNode;
  activeKey?: string;
  level?: number;
}

const props = withDefaults(defineProps<Props>(), {
  activeKey: '',
  level: 0
});

const emit = defineEmits(['jump', 'contextmenu']);

const expanded = ref(props.node.expanded !== false);

const toggleExpand = () => {
  if (props.node.type === 'folder') {
    expanded.value = !expanded.value;
  }
};

const handleClick = () => {
  if (props.node.type === 'folder') {
    toggleExpand();
  } else if (props.node.data) {
    emit('jump', props.node.data.id);
  }
};

const handleContextMenu = (e: PointerEvent) => {
  if (props.node.type === 'item' && props.node.data) {
    emit('contextmenu', props.node.data, e);
  }
};
</script>

<style scoped lang="less">
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
</style>
