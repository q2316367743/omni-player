<template>
  <div class="nav-group">
    <div class="group-title justify-between">
      <div class="flex items-center gap-4px" @click="toggleGroup">
        <span class="toggle-icon">
          <minus-icon v-if="groupExpanded"/>
          <add-icon v-else/>
        </span>
        <span class="group-title-text">媒体库</span>
      </div>
      <t-button theme="primary" size="small" variant="text" shape="square"
                @click="openMediaServerEdit()">
        <template #icon>
          <add-icon/>
        </template>
      </t-button>
    </div>
    <div v-show="groupExpanded" v-for="media in medias" :key="media.id"
         :class="{active: activeKey === `/media/${media.id}`, 'nav-item' : true}"
         @click="jumpMedia(media.id)" @contextmenu="openMediaContextmenu(media, $event)">
      <div class="nav-item-content">
        <component :is="getMediaIcon(media.type)" class="w-16px h-16px"/>
        <span class="nav-text">{{ media.name }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {AddIcon, MinusIcon} from "tdesign-icons-vue-next";
import {openMediaContextmenu, openMediaServerEdit} from "@/layouts/AppSide/func/MediaServerEdit.tsx";
import {useMediaServerStore} from "@/store";
import type {MediaServerType} from "@/entity/MediaServer.ts";
import JellyfinIcon from "@/modules/icon/JellyfinIcon.vue";
import EmbyIcon from "@/modules/icon/EmbyIcon.vue";
import PlexIcon from "@/modules/icon/PlexIcon.vue";
import {LocalName} from "@/global/LocalName.ts";

const router = useRouter();

defineProps({
  activeKey: String
});

const medias = computed(() => {
  return [...useMediaServerStore().servers].sort((a, b) => {
    const diff = a.sequence - b.sequence;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  })
});

const groupExpanded = useLocalStorage(LocalName.APP_ASIDE_MEDIA_EXPANDED, true);

const toggleGroup = () => {
  groupExpanded.value = !groupExpanded.value;
};

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
const jumpMedia = (id: string) => router.push(`/media/${id}/home`);
</script>
<style scoped lang="less">
.group-title {
  .toggle-icon {
    cursor: pointer;
    font-size: 12px;
    color: var(--td-text-color-secondary);
    transition: transform 0.2s;
    
    &:hover {
      color: var(--td-text-color-primary);
    }
  }
}
</style>
