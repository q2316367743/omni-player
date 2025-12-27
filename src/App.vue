<template>
  <t-layout class="abs-0 overflow-hidden">
    <t-aside :width="collapsed ? '0' : '232px'">
      <app-aside/>
    </t-aside>
    <t-content class="h-full relative z-2 app-content">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['NetworkAggregation']">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {collapsed} from "@/global/Constants.ts";
import AppAside from "@/layouts/AppSide/AppAside.vue";
import {setupRefreshFeedTask} from "@/modules/subscribe/RefreshFeedTask.ts";

// 注册定时刷新任务
setupRefreshFeedTask();
</script>
<style scoped lang="less">
.app-content {
  transform: scale(1);
}
</style>
