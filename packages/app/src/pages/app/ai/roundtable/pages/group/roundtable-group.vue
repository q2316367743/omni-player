<template>
  <div>
    <div class="flex items-center">
      <t-button theme="primary" variant="text" shape="square" @click="toggleCollapsed()" v-if="collapsed">
        <template #icon>
          <menu-fold-icon/>
        </template>
      </t-button>
      <t-divider layout="vertical" v-if="collapsed"/>
      <div class="rm-title">分组管理</div>
    </div></div>
</template>
<script lang="ts" setup>
import {MenuFoldIcon} from "tdesign-icons-vue-next";

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['toggleCollapsed']);
const toggleCollapsed = () => {
  emit('toggleCollapsed');
}
</script>
<style scoped lang="less">

</style>
