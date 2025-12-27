<template>
  <div class="abs-0 overflow-hidden">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="['NetworkAggregation']">
        <component :is="Component" :key="route.fullPath"/>
      </keep-alive>
    </router-view>
  </div>
</template>
<script lang="ts" setup>
import {setupRefreshFeedTask} from "@/modules/subscribe/RefreshFeedTask.ts";

// 注册定时刷新任务
setupRefreshFeedTask();
</script>
<style scoped lang="less">
.app-content {
  transform: scale(1);
}
</style>
