<template>
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
</template>

<script lang="ts" setup>
import {useMediaServerStore} from "@/store";
import {ServerIcon, AddIcon} from "tdesign-icons-vue-next";
import type {MediaServerType} from "@/entity/MediaServer.ts";
import type {MediaServer} from "@/entity/MediaServer.ts";
import JellyfinIcon from "@/modules/icon/JellyfinIcon.vue";
import EmbyIcon from "@/modules/icon/EmbyIcon.vue";
import PlexIcon from "@/modules/icon/PlexIcon.vue";
import {openMediaContextmenu, openMediaServerEdit} from "@/pages/home/func/MediaServerEdit.tsx";

const router = useRouter();

const medias = computed(() => {
  return [...useMediaServerStore().servers].sort((a, b) => {
    const diff = a.sequence - b.sequence;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
});

const jumpMedia = (id: string) => router.push(`/media/${id}/home`);

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
</script>

<style scoped lang="less">
@import "../home-index.less";
</style>
