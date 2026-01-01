<template>
  <div class="event-tab">
    <div class="event-content">
      <div class="event-icon">
        <time-icon/>
      </div>
      <div class="event-text">事件分析功能开发中</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {TimeIcon} from "tdesign-icons-vue-next";
</script>

<style scoped lang="less">
.event-tab {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--td-comp-margin-m);
  color: var(--td-text-color-placeholder);
}

.event-icon {
  font-size: 64px;
  opacity: 0.3;
}

.event-text {
  font-size: var(--td-font-size-body-medium);
}
</style>
