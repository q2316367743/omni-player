<template>
  <div class="app-layout">
    <div class="app-layout-header">
      <div class="w-24px" v-if="collapsed">
        <t-button theme="primary" size="small" variant="text" shape="square"
                  @click="toggleCollapsed()">
          <template #icon>
            <menu-icon/>
          </template>
        </t-button>
      </div>
      <div class="flex gap-4px items-center shrink-0">
        <slot name="header"/>
      </div>
    </div>
    <div class="app-layout-content">
      <slot name="content"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {MenuIcon} from "tdesign-icons-vue-next";
import {collapsed, toggleCollapsed} from "@/global/Constants.ts";
</script>
<style scoped lang="less">
.app-layout {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  user-select: none;
  background-color: var(--td-bg-color-container);

  .app-layout-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 32px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    align-items: center;
    padding-left: 16px;
    gap: 8px;
  }

  .app-layout-content {
    position: absolute;
    top: 33px;
    left: 0;
    width: 100%;
    height: calc(100vh - 33px);
    transform: scale(1);
  }
}
</style>
