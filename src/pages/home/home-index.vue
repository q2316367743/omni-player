<template>
  <div class="home-container">
    <div class="main-content">
      <div class="top-row">
        <div class="welcome-card">
          <div class="welcome-info">
            <h1 class="welcome-title">欢迎使用亦无悔</h1>
            <p class="welcome-subtitle">一站式多媒体管理平台</p>
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
          <div class="tools-container">
            <div class="section-header">
              <h2 class="section-title">实用工具箱</h2>
              <p class="section-subtitle">高效便捷的在线工具集合</p>
            </div>

            <div class="tools-group">
              <div class="group-title">本地工具</div>
              <div class="tools-grid">
                <div class="tool-card" @click="jumpTool('regex')">
                  <div class="tool-icon regex">
                    <code-icon/>
                  </div>
                  <div class="tool-info">
                    <div class="tool-name">正则表达式</div>
                    <div class="tool-desc">测试和调试正则表达式</div>
                  </div>
                </div>
                <div class="tool-card" @click="jumpTool('http')">
                  <div class="tool-icon http">
                    <internet-icon/>
                  </div>
                  <div class="tool-info">
                    <div class="tool-name">简单请求</div>
                    <div class="tool-desc">快速发送 HTTP 请求</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="tools-group">
              <div class="group-title">在线工具</div>
              <div class="tools-grid">
                <div class="tool-card" @click="jumpTool('fanyi')">
                  <div class="tool-icon online">
                    <translate-icon/>
                  </div>
                  <div class="tool-info">
                    <div class="tool-name">在线翻译</div>
                    <div class="tool-desc">在线双向翻译</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="tools-group">
              <div class="group-title">媒体工具</div>
              <div class="tools-grid">
                <div class="tool-card" @click="jumpTool('qushuiyin')">
                  <div class="tool-icon media">
                    <video-icon/>
                  </div>
                  <div class="tool-info">
                    <div class="tool-name">去水印</div>
                    <div class="tool-desc">视频图片水印去除</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="resources-container">
            <div class="resource-section">
              <div class="resource-header">
                <h3 class="resource-title">
                  <server-icon class="title-icon"/>
                  媒体库
                </h3>
                <t-button theme="primary" variant="text" shape="square"
                          @click="openMediaServerEdit()">
                  <template #icon>
                    <add-icon/>
                  </template>
                </t-button>
              </div>
              <div class="resource-grid">
                <div v-for="media in medias" :key="media.id" class="resource-card" @click="jumpMedia(media.id)"
                     @contextmenu="handleMediaContextmenu(media, $event)">
                  <div class="resource-icon" :class="media.type">
                    <component :is="getMediaIcon(media.type)"/>
                  </div>
                  <div class="resource-info">
                    <div class="resource-name">{{ media.name }}</div>
                    <div class="resource-type">{{ getMediaTypeName(media.type) }}</div>
                  </div>
                </div>
                <div v-if="medias.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <server-icon/>
                  </div>
                  <div class="empty-text">暂无媒体库</div>
                </div>
              </div>
            </div>

            <div class="resource-section">
              <div class="resource-header">
                <h3 class="resource-title">
                  <internet-icon class="title-icon"/>
                  网络资源
                </h3>
                <div class="flex gap-4px">
                  <t-button theme="primary" variant="text" shape="square"
                            @click="openSearchModelWrap()">
                    <template #icon>
                      <search-icon/>
                    </template>
                  </t-button>
                  <t-button theme="primary" variant="text" shape="square"
                            @click="openNetworkServerEdit()">
                    <template #icon>
                      <add-icon/>
                    </template>
                  </t-button>
                </div>
              </div>
              <div class="resource-grid">
                <div v-for="network in networks" :key="network.id" class="resource-card" @click="jumpNetwork(network.id)"
                     @contextmenu="handleNetworkContextmenu(network, $event)">
                  <div class="resource-icon network">
                    <internet-icon/>
                  </div>
                  <div class="resource-info">
                    <div class="resource-name">{{ network.name }}</div>
                    <div class="resource-type">{{ network.group || '未分组' }}</div>
                  </div>
                </div>
                <div v-if="networks.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <internet-icon/>
                  </div>
                  <div class="empty-text">暂无网络资源</div>
                </div>
              </div>
            </div>

            <div class="resource-section">
              <div class="resource-header">
                <h3 class="resource-title">
                  <rss-icon class="title-icon"/>
                  订阅源
                </h3>
                <div class="flex gap-4px">
                  <t-button theme="primary" size="small" variant="text" shape="square" @click="subscribeStore.refresh()">
                    <template #icon>
                      <refresh-icon/>
                    </template>
                  </t-button>
                  <t-button theme="primary" size="small" variant="text" shape="square"
                            @click="openSubscribeEditWrap()">
                    <template #icon>
                      <add-icon/>
                    </template>
                  </t-button>
                </div>
              </div>
              <div class="subscribe-tree-wrapper">
                <subscribe-tree-view
                  v-if="subscribeTree.length > 0"
                  :nodes="subscribeTree"
                  @jump="jumpSubscribe"
                  @contextmenu="handleSubscribeContextmenu"
                />
                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <rss-icon/>
                  </div>
                  <div class="empty-text">暂无订阅源</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="poetry-section">
      <shi-ci/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NowClock from "./components/NowClock.vue";
import SubscribeTreeView from "./components/SubscribeTreeView.vue";
import {useMediaServerStore, useNetworkServerStore} from "@/store";
import {useRequest} from "@/hooks/UseRequest.ts";
import {listSubscribe} from "@/services";
import ShiCi from "@/pages/home/components/ShiCi.vue";
import {
  CodeIcon,
  InternetIcon,
  TranslateIcon,
  VideoIcon,
  ServerIcon,
  RssIcon,
  AddIcon, SearchIcon, RefreshIcon
} from "tdesign-icons-vue-next";
import type {MediaServerType} from "@/entity/MediaServer.ts";
import type {MediaServer} from "@/entity/MediaServer.ts";
import type {NetworkServer} from "@/entity/NetworkServer.ts";
import type {SubscribeItem} from "@/entity/subscribe";
import JellyfinIcon from "@/modules/icon/JellyfinIcon.vue";
import EmbyIcon from "@/modules/icon/EmbyIcon.vue";
import PlexIcon from "@/modules/icon/PlexIcon.vue";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";
import {openMediaContextmenu, openMediaServerEdit} from "@/pages/home/func/MediaServerEdit.tsx";
import {openNetworkContextmenu, openNetworkServerEdit} from "@/pages/home/func/NetworkServerEdit.tsx";
import {openSubscribeContextmenu, openSubscribeEdit} from "@/pages/home/func/SubscribeEdit.tsx";
import {openSearchModel} from "@/util/model/SearchUtil.tsx";

const router = useRouter();

const mediaCount = computed(() => useMediaServerStore().servers.length);
const networkCount = computed(() => useNetworkServerStore().servers.length);
const {data: subscriptions} = useRequest(listSubscribe, {defaultValue: []});
const subscribeCount = computed(() => subscriptions.value.length);

const jumpTool = (model: string) => router.push(`/app/tool/${model}`);

const medias = computed(() => {
  return [...useMediaServerStore().servers].sort((a, b) => {
    const diff = a.sequence - b.sequence;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
});

const networks = computed(() => {
  return [...useNetworkServerStore().servers].sort((a, b) => {
    const groupDiff = a.group.localeCompare(b.group);
    if (groupDiff !== 0) return groupDiff;
    const diff = a.sequence - b.sequence;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
});

const subscribeStore = useSubscribeStore();
const subscribeTree = computed(() => subscribeStore.subscribeTree);

const jumpMedia = (id: string) => router.push(`/media/${id}/home`);
const jumpNetwork = (id: string) => router.push(`/network/${id}/home`);
const jumpSubscribe = (id: string) => router.push(`/subscribe/${id}/0`);

const getMediaIcon = (type: MediaServerType) => {
  switch (type) {
    case 'jellyfin':
      return JellyfinIcon;
    case 'emby':
      return EmbyIcon;
    case 'plex':
      return PlexIcon;
  }
};

const getMediaTypeName = (type: MediaServerType) => {
  switch (type) {
    case 'jellyfin':
      return 'Jellyfin';
    case 'emby':
      return 'Emby';
    case 'plex':
      return 'Plex';
  }
};

const handleMediaContextmenu = (media: MediaServer, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  openMediaContextmenu(media, e);
};

const handleNetworkContextmenu = (network: NetworkServer, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  openNetworkContextmenu(network, e);
};

const handleSubscribeContextmenu = (subscribe: SubscribeItem, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  openSubscribeContextmenu(subscribeStore.refresh, subscribe, e);
};
const openSearchModelWrap = () => {
  openSearchModel().then(keyword => {
    if (!keyword) return;
    router.push({
      path: '/network/aggregation',
      query: {
        keyword
      }
    })

  })
}
const openSubscribeEditWrap = () => openSubscribeEdit(subscribeStore.refresh);
</script>

<style scoped lang="less">
@import "./home-index.less";
</style>
