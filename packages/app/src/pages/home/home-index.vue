<template>
  <div class="home-container">
    <div class="main-content">
      <div class="top-row">
        <div class="welcome-card">
          <div class="welcome-info">
            <h1 class="welcome-title">欢迎使用<span class="gradient-text">「楼下小黑」</span></h1>
            <p class="welcome-subtitle">
              <shi-ci/>
            </p>
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

      <t-card size="small">
        <t-tabs v-model="activeKey">
          <template #action>
            <t-button theme="primary" shape="square" class="!mt-8px"
                      @click="toSetting">
              <template #icon>
                <setting-icon />
              </template>
            </t-button>
          </template>
          <t-tab-panel label="工" value="tool" draggable>
            <tools-section/>
          </t-tab-panel>
          <t-tab-panel label="写" value="fiction" draggable>
            <fiction-section />
          </t-tab-panel>
          <t-tab-panel label="书" value="book" draggable>
            <subscribe-sources-section/>
          </t-tab-panel>
          <t-tab-panel label="影" value="video" draggable>
            <video-section/>
          </t-tab-panel>
          <t-tab-panel label="音" value="music" draggable/>
        </t-tabs>
      </t-card>

    </div>

  </div>
</template>

<script lang="ts" setup>
import {useMediaServerStore, useNetworkServerStore} from "@/store";
import {useRequest} from "@/hooks/UseRequest.ts";
import {listSubscribe} from "@/services";
import {LocalName} from "@/global/LocalName.ts";
import NowClock from "./components/NowClock.vue";
import ToolsSection from "./components/ToolsSection.vue";
import SubscribeSourcesSection from "./components/SubscribeSourcesSection.vue";
import ShiCi from "@/pages/home/components/ShiCi.vue";
import VideoSection from "@/pages/home/components/VideoSection.vue";
import {SettingIcon} from "tdesign-icons-vue-next";
import FictionSection from "@/pages/home/components/FictionSection.vue";

const router = useRouter();
const activeKey = useLocalStorage(LocalName.PAGE_HOME_ACTIVE, 'book');

const mediaCount = computed(() => useMediaServerStore().servers.length);
const networkCount = computed(() => useNetworkServerStore().servers.length);
const {data: subscriptions} = useRequest(listSubscribe, {defaultValue: []});
const subscribeCount = computed(() => subscriptions.value.length);

const toSetting = () => {
  router.push('/admin/global-setting');
}
</script>

<style scoped lang="less">
@import "home-index.less";
</style>
