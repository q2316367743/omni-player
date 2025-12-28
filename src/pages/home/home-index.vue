<template>
  <div class="home-container">
    <div class="main-content">
      <div class="top-row">
        <div class="welcome-card">
          <div class="welcome-info">
            <h1 class="welcome-title">欢迎使用亦无悔</h1>
            <p class="welcome-subtitle"><shi-ci/></p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ mediaCount }}</div>
              <div class="stat-label">媒体库</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ networkCount }}</div>
              <div class="stat-label">网络资源</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ subscribeCount }}</div>
              <div class="stat-label">订阅源</div>
            </div>
          </div>
        </div>
        <NowClock/>
      </div>

      <div class="content-grid">
        <div class="left-column">
          <tools-section/>
        </div>

        <div class="right-column">
          <div class="resources-container">
            <media-library-section/>
            <network-resources-section/>
            <subscribe-sources-section/>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import NowClock from "./components/NowClock.vue";
import ToolsSection from "./components/ToolsSection.vue";
import MediaLibrarySection from "./components/MediaLibrarySection.vue";
import NetworkResourcesSection from "./components/NetworkResourcesSection.vue";
import SubscribeSourcesSection from "./components/SubscribeSourcesSection.vue";
import {useMediaServerStore, useNetworkServerStore} from "@/store";
import {useRequest} from "@/hooks/UseRequest.ts";
import {listSubscribe} from "@/services";
import ShiCi from "@/pages/home/components/ShiCi.vue";

const mediaCount = computed(() => useMediaServerStore().servers.length);
const networkCount = computed(() => useNetworkServerStore().servers.length);
const {data: subscriptions} = useRequest(listSubscribe, {defaultValue: []});
const subscribeCount = computed(() => subscriptions.value.length);
</script>

<style scoped lang="less">
@import "./home-index.less";
</style>
