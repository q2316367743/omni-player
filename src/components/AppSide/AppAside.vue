<template>
  <div class="app-aside">
    <!-- Header -->
    <div class="aside-header">
      <div class="header-left">
        <t-button theme="primary" size="small" variant="text" shape="square" @click="toggleCollapsed()">
          <template #icon>
            <menu-fold-icon/>
          </template>
        </t-button>
        <span class="header-title">亦无悔</span>
      </div>
      <div class="header-actions">
        <t-button theme="primary" size="small" variant="text" shape="square" :disabled="disableBack" @click="goBack">
          <template #icon>
            <chevron-left-icon/>
          </template>
        </t-button>
        <t-button theme="primary" size="small" variant="text" shape="square" :disabled="disableHome" @click="goHome">
          <template #icon>
            <home-icon/>
          </template>
        </t-button>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="aside-content">

      <!-- 媒体库 -->
      <div class="nav-group">
        <div class="group-title">
          <span>媒体库</span>
          <t-button class="ml-auto" theme="primary" size="small" variant="text" shape="square"
                    @click="openMediaServerEdit()">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
        </div>
        <div v-for="media in medias" :key="media.id" :class="{active: isActive(media.id, 'media'), 'nav-item' : true}"
             @click="jumpMedia(media.id)" @contextmenu="openMediaContextmenu(media, $event)">
          <div class="nav-item-content">
            <component :is="getMediaIcon(media.type)" class="w-16px h-16px"/>
            <span class="nav-text">{{ media.name }}</span>
          </div>
        </div>
      </div>

      <!-- 网络库 -->
      <div class="nav-group">
        <div class="group-title">
          <span>网络资源</span>
          <t-button class="ml-auto" theme="primary" size="small" variant="text" shape="square"
                    @click="openSearchModelWrap()">
            <template #icon>
              <search-icon/>
            </template>
          </t-button>
          <t-button class="ml-4px" theme="primary" size="small" variant="text" shape="square"
                    @click="openNetworkServerEdit()">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
        </div>
        <div v-for="network in networks" :key="network.id"
             :class="{active: isActive(network.id, 'network'), 'nav-item' : true}"
             @click="jumpNetwork(network.id)" @contextmenu="openNetworkContextmenu(network, $event)">
          <div class="nav-item-content">
            <internet-icon :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]'
                           :stroke-width="2"/>
            <span class="nav-text">{{ network.name }}</span>
          </div>
        </div>
      </div>

      <!-- 订阅 -->
      <div class="nav-group">
        <div class="group-title justify-between">
          <div>订阅源</div>
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
        <div v-for="sub in subscribes" :key="sub.id" @click="jumpSubscribe(sub.id)"
             :class="{active: isActive(sub.id, 'subscribe'), 'nav-item' : true}"
             @contextmenu="openSubscribeContextmenuWrap(sub, $event)">
          <div class="nav-item-content">
            <t-image v-if="sub.icon" :src="sub.icon" class="feed-icon-img" alt="" width="16px" height="16px">
              <template #error>
                <logo-github-icon class="nav-icon"/>
              </template>
            </t-image>
            <logo-github-icon v-else class="nav-icon"/>
            <span class="nav-text">{{ sub.name }}</span>
          </div>
          <span v-if="sub.count" class="count-badge">{{ sub.count }}</span>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="nav-group">
        <div class="group-title">笔记</div>
        <div class="nav-item">
          <div class="nav-item-content">
            <file-icon class="nav-icon"/>
            <span class="nav-text">全部笔记</span>
          </div>
          <span class="count-badge">3</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="aside-footer">
      <div class="nav-item" @click="$router.push('/admin/global-setting')">
        <div class="nav-item-content">
          <setting-icon class="nav-icon"/>
          <span class="nav-text">偏好设置</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  AddIcon,
  LogoGithubIcon,
  FileIcon,
  SettingIcon, HomeIcon, ChevronLeftIcon, MenuFoldIcon, InternetIcon, RefreshIcon, SearchIcon
} from 'tdesign-icons-vue-next';
import {useMediaServerStore, useNetworkServerStore} from "@/store";
import type {MediaServerType} from "@/entity/MediaServer.ts";
import JellyfinIcon from "@/modules/icon/JellyfinIcon.vue";
import EmbyIcon from "@/modules/icon/EmbyIcon.vue";
import PlexIcon from "@/modules/icon/PlexIcon.vue";
import {openMediaContextmenu, openMediaServerEdit} from "@/components/AppSide/func/MediaServerEdit.tsx";
import {openNetworkContextmenu, openNetworkServerEdit} from "@/components/AppSide/func/NetworkServerEdit.tsx";
import {toggleCollapsed} from "@/global/Constants.ts";
import {openSubscribeContextmenu, openSubscribeEdit} from "@/components/AppSide/func/SubscribeEdit.tsx";
import type {SubscribeItem} from "@/entity/subscribe";
import {openSearchModel} from "@/util/model/SearchUtil.tsx";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";

const router = useRouter();
const route = useRoute();

const disableBack = computed(() => false);
const disableHome = computed(() => route.path === '/home');

const medias = computed(() => {
  return [...useMediaServerStore().servers].sort((a, b) => {
    const diff = a.sequence - b.sequence;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  })
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
const subscribes = computed(() => subscribeStore.subscribes);

const goBack = () => router.back();
const goHome = () => router.replace('/home');

const jumpMedia = (id: string) => router.push(`/media/${id}/home`);
const jumpNetwork = (id: string) => router.push(`/network/${id}/home`);
const jumpSubscribe = (id: string) => router.push(`/subscribe/${id}/0`);

const isActive = (id: string, prefix: string) => route.path.startsWith(`/${prefix}/${id}`);

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
const openSubscribeEditWrap = () => openSubscribeEdit(subscribeStore.refresh);
const openSubscribeContextmenuWrap = (server: SubscribeItem, e: PointerEvent) => openSubscribeContextmenu(subscribeStore.refresh, server, e)
const openSearchModelWrap = () => {
  openSearchModel()
}
</script>

<style scoped lang="less">
@import "./AppAside.less";
</style>
