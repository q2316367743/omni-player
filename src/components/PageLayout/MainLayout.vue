<template>
  <div class="app-layout">
    <div class="app-layout-header" data-tauri-drag-region>
      <div class="ml-4px flex gap-4px items-center shrink-0">
        <slot name="header"/>
      </div>
    </div>
    <div class="app-layout-content">
      <slot name="content"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped lang="less">
.app-layout {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  user-select: none;

  .app-layout-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 32px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    justify-content: space-between;
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
