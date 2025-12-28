<template>
  <app-tool-layout title="今日热榜">
    <div class="dailyhot">
        <div class="dailyhot-container">
          <dailyhost-platform :selected-platform="selectedPlatform" @choose="selectPlatform"/>
          <dailyhost-content :selected-platform="selectedPlatform" />
        </div>
    </div>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import {LocalName} from '@/global/LocalName.ts';
import DailyhostPlatform from "@/pages/app/dailyhot/components/dailyhost-platform.vue";
import DailyhostContent from "@/pages/app/dailyhot/components/dailyhost-content.vue";

const selectedPlatform = useLocalStorage(LocalName.PAGE_APP_DAILY_HOT_SELECTED_PLATFORM, '');

const selectPlatform = (platform: string) => {
  selectedPlatform.value = platform;
}
</script>

<style scoped lang="less">
.dailyhot {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--td-bg-color-container);

  .dailyhot-container {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

}
</style>
