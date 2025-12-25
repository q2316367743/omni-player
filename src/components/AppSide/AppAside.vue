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
        <t-button variant="text" shape="square" size="small" theme="primary">
          <template #icon>
            <add-icon/>
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
        <div v-for="media in medias" :key="media.id" :class="{active: mediaActive(media.id), 'nav-item' : true}"
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
                    @click="openNetworkServerEdit()">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
        </div>
        <div v-for="network in networks" :key="network.id" :class="{active: mediaActive(network.id), 'nav-item' : true}"
             @click="jumpNetword(network.id)" @contextmenu="openNetworkContextmenu(network, $event)">
          <div class="nav-item-content">
              <internet-icon :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]'
                             :stroke-width="2"/>
            <span class="nav-text">{{ network.name }}</span>
          </div>
        </div>
      </div>

      <!-- Feeds Section -->
      <div class="nav-group">
        <div class="group-title">订阅源</div>
        <div class="nav-item" v-for="sub in subscriptions" :key="sub.name">
          <div class="nav-item-content">
            <img v-if="sub.icon" :src="sub.icon" class="feed-icon-img" alt=""/>
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
import {ref} from 'vue';
import {
  AddIcon,
  LogoGithubIcon,
  FileIcon,
  SettingIcon, HomeIcon, ChevronLeftIcon, MenuFoldIcon, InternetIcon
} from 'tdesign-icons-vue-next';
import {useMediaServerStore, useNetworkServerStore} from "@/store";
import type {MediaServerType} from "@/entity/MediaServer.ts";
import JellyfinIcon from "@/modules/icon/JellyfinIcon.vue";
import EmbyIcon from "@/modules/icon/EmbyIcon.vue";
import PlexIcon from "@/modules/icon/PlexIcon.vue";
import {openMediaContextmenu, openMediaServerEdit} from "@/components/AppSide/func/MediaServerEdit.tsx";
import {openNetworkContextmenu, openNetworkServerEdit} from "@/components/AppSide/func/NetworkServerEdit.tsx";
import {toggleCollapsed} from "@/global/Constants.ts";

const router = useRouter();
const route = useRoute();

const disableBack = computed(() => false);
const disableHome = computed(() => route.path === '/home');

const goBack = () => router.back();
const goHome = () => router.replace('/home');

const jumpMedia = (id: string) => router.push(`/media/${id}/home`);
const jumpNetword = (id: string) => router.push(`/network/${id}/home`);
const mediaActive = (id: string) => route.path.startsWith(`/media/${id}`);

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

const subscriptions = ref([
  {name: '方糖07', count: 7, icon: ''},
  {name: 'SwiftUI Recipes', count: 10, icon: ''},
  {name: 'Marco.org', count: 20, icon: ''},
  {name: '潮流周刊', count: 5, icon: ''},
]);
</script>

<style scoped lang="less">
.app-aside {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 231px;
  background-color: var(--td-bg-color-container); // Warm light background from image
  border-right: 1px solid var(--td-border-level-1-color);
  user-select: none;
  font-size: 13px;
  color: var(--td-text-color-primary);
  overflow: hidden;

  .aside-header {
    height: 32px; // Taller header to accommodate traffic lights area if needed, or just style
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    // border-bottom: 1px solid var(--td-border-level-1-color);

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--td-text-color-primary);

    }

    .header-actions {
      display: flex;
      gap: 4px;

    }
  }

  .aside-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;

  }

  .nav-group {
    margin-bottom: 24px;

    .group-title {
      font-size: 11px;
      color: var(--td-text-color-secondary);
      font-weight: 500;
      margin-bottom: 8px;
      padding-left: 8px;
      user-select: none;
      display: flex;
      align-items: center;
    }
  }

  .nav-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 2px;

    &:hover {
      background-color: var(--td-bg-color-container-hover);
      align-items: center;
    }

    &.active {
      background-color: var(--td-bg-color-container-active); // Reddish active color
      color: white;

      .count-badge {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .nav-icon, .nav-text {
        color: white;
      }
    }

    .nav-item-content {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;

      .nav-icon {
        font-size: 16px;
        opacity: 0.8;
      }

      .feed-icon-img {
        width: 16px;
        height: 16px;
        border-radius: 3px;
      }

      .nav-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .count-badge {
      font-size: 11px;
      background-color: #f0e6e6; // Light reddish grey
      color: #b85c5c;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
      font-weight: 500;
    }
  }

  .folder-item {
    .expand-icon {
      font-size: 14px;
      color: #999;
      margin-right: -4px;
    }

    .folder-icon {
      color: #dfae64; // Folder yellow color
    }
  }

  .folder-children {
    margin-left: 12px;
    border-left: 1px solid transparent; // Could add guide line if needed

    .nav-item {
      padding-left: 8px;
    }
  }

  .aside-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--td-border-level-1-color);
    background-color: var(--td-bg-color-component);
  }
}
</style>
