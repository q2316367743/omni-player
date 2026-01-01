<template>
  <div class="insight-tab">
    <div class="insight-content">
      <div class="insight-icon">
        <lightbulb-icon/>
      </div>
      <div class="insight-text">消费洞察功能开发中</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {LightbulbIcon} from "tdesign-icons-vue-next";
</script>

<style scoped lang="less">
.insight-tab {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.insight-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--td-comp-margin-m);
  color: var(--td-text-color-placeholder);
}

.insight-icon {
  font-size: 64px;
  opacity: 0.3;
}

.insight-text {
  font-size: var(--td-font-size-body-medium);
}
</style>
