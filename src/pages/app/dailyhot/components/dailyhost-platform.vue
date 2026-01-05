<template>
  <div class="platform-sidebar">
    <div class="sidebar-header">
      <t-input
        v-model="searchKeyword"
        placeholder="搜索平台"
        clearable
      >
        <template #prefix-icon>
          <search-icon/>
        </template>
      </t-input>
      <t-button
        variant="text"
        shape="square"
        class="w-32px min-w-32px"
        :loading="refreshingPlatforms"
        @click="refreshPlatforms"
      >
        <template #icon>
          <refresh-icon/>
        </template>
      </t-button>
    </div>
    <div class="platform-list">
      <div
        v-for="({item: platform}) in filteredPlatforms"
        :key="platform.value"
        class="platform-item"
        :class="{ active: selectedPlatform === platform.value }"
        @click="selectPlatform(platform.value)"
      >
        <span class="platform-name">{{ platform.label }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {RefreshIcon, SearchIcon} from "tdesign-icons-vue-next";
import {LocalName} from "@/global/LocalName.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useFuse} from "@vueuse/integrations/useFuse"
import type {CommonOption} from "@/global/CommonType.ts";
import {useNewsService} from "@/modules/news/NewsFactory.ts";

const props = defineProps({
  selectedPlatform: {
    type: String,
    default: ''
  }
});
const emit = defineEmits(['choose']);

const searchKeyword = ref('');
const refreshingPlatforms = ref(false);
const platforms = useLocalStorage(LocalName.PAGE_APP_DAILY_HOT_LIST_PLATFORM, new Array<CommonOption>());
const refreshTime = useLocalStorage(LocalName.PAGE_APP_DAILY_HOT_REFRESH_TIME, 0);


const {results: filteredPlatforms} = useFuse(searchKeyword, platforms, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ['label']
  }
})

const selectPlatform = (platform: string) => {
  emit('choose', platform);
};

const fetchPlatforms = async (forceRefresh = false) => {
  const oneDay = 24 * 60 * 60 * 1000;

  if ((Date.now() - refreshTime.value) < oneDay && !forceRefresh) {
    return;
  }

  refreshingPlatforms.value = true;
  try {
    platforms.value = await useNewsService().platforms();
    refreshTime.value = Date.now();
    MessageUtil.success('平台列表已更新');
    if (!props.selectedPlatform || !platforms.value.map(e => e.value).includes(props.selectedPlatform)) {
      const first = platforms.value[0]?.value;
      if (first) {
        selectPlatform(first);
      }
    }
  } catch (error) {
    console.error('获取平台列表错误:', error);
    MessageUtil.error('网络请求失败');
  } finally {
    refreshingPlatforms.value = false;
  }
};


const refreshPlatforms = async () => {
  await fetchPlatforms(true);
};

onMounted(() => fetchPlatforms());
</script>
<style scoped lang="less">
.platform-sidebar {
  width: 240px;
  min-width: 240px;
  border-right: 1px solid var(--fluent-sidebar-border);
  display: flex;
  flex-direction: column;
  background: var(--fluent-sidebar-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  height: calc(100vh - 57px);
  overflow: hidden;

  .sidebar-header {
    position: sticky;
    left: 0;
    top: 0;
    padding: 14px;
    border-bottom: 1px solid var(--fluent-sidebar-border);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    background: var(--fluent-sidebar-bg);
    backdrop-filter: var(--fluent-acrylic-blur);
    z-index: 1;

    .t-input {
      flex: 1;

      :deep(.t-input__inner) {
        border-radius: var(--fluent-radius-smooth);
        border: 1px solid var(--fluent-border-subtle);
        background: var(--fluent-card-bg);
        transition: all var(--fluent-transition-normal);

        &:hover {
          background: var(--fluent-card-bg-hover);
          border-color: var(--fluent-border-subtle-dark);
        }

        &:focus {
          outline: none;
          box-shadow: var(--fluent-focus-ring);
        }
      }
    }

    .t-button {
      border-radius: var(--fluent-radius-smooth);
      background: var(--fluent-card-bg);
      border: 1px solid var(--fluent-border-subtle);
      transition: all var(--fluent-transition-normal);

      &:hover {
        background: var(--fluent-item-hover);
        transform: translateY(-1px);
        box-shadow: var(--fluent-elevation-1);
      }

      &:active {
        transform: translateY(0);
        background: var(--fluent-item-active);
      }
    }
  }

  .platform-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--td-scrollbar-color);
      border-radius: 4px;
      transition: background var(--fluent-transition-fast);

      &:hover {
        background: var(--td-scrollbar-hover-color);
      }
    }

    .platform-item {
      position: relative;
      padding: 12px 20px;
      margin: 2px 8px;
      cursor: pointer;
      transition: all var(--fluent-transition-normal);
      border-radius: var(--fluent-radius-smooth);
      border-left: 3px solid transparent;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--fluent-reveal-bg);
        opacity: 0;
        transition: opacity var(--fluent-transition-fast);
        pointer-events: none;
      }

      &:hover {
        background: var(--fluent-item-hover);
        transform: translateX(2px);

        &::before {
          opacity: 1;
        }
      }

      &:active {
        background: var(--fluent-item-active);
        transform: translateX(0);
      }

      &.active {
        background: var(--fluent-item-selected);
        border-left-color: var(--fluent-item-selected-border);
        color: var(--fluent-accent-color);
        font-weight: 600;
        box-shadow: var(--fluent-elevation-1);

        &::before {
          opacity: 1;
          background: var(--fluent-item-selected);
        }
      }

      .platform-name {
        position: relative;
        font-size: 14px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: 0.01em;
      }
    }
  }
}
</style>
