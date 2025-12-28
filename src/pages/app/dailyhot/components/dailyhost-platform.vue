<template>
  <div class="platform-sidebar">
    <div class="sidebar-header">
      <t-input
        v-model="searchKeyword"
        placeholder="搜索平台"
        clearable
        size="small"
      >
        <template #prefix-icon>
          <search-icon/>
        </template>
      </t-input>
      <t-button
        variant="text"
        size="small"
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
import {getAction} from "@/lib/http.ts";
import type {PlatformListResponse} from "@/pages/app/dailyhot/types.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useFuse} from "@vueuse/integrations/useFuse"
import type {SelectOption} from "@/global/CommonType.ts";

const props = defineProps({
  selectedPlatform: {
    type: String,
    default: ''
  }
});
const emit = defineEmits(['choose']);

const API_URL = 'https://api.pearktrue.cn/api/dailyhot/';


const searchKeyword = ref('');
const refreshingPlatforms = ref(false);
const platforms = useLocalStorage(LocalName.PAGE_APP_DAILY_HOT_LIST_PLATFORM, new Array<SelectOption>());
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
    const {data} = await getAction<PlatformListResponse>(API_URL);

    if (data.code === 200 && data.data?.platforms) {
      platforms.value = data.data.platforms.map(e => ({label: e, value: e}));
      refreshTime.value = Date.now();
      MessageUtil.success('平台列表已更新');
      if (!props.selectedPlatform || !platforms.value.map(e => e.value).includes(props.selectedPlatform)) {
        const first = platforms.value[0]?.value;
        if (first) {
          selectPlatform(first);
        }
      }
    } else {
      MessageUtil.error('获取平台列表失败');
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
  width: 200px;
  min-width: 200px;
  border-right: 1px solid var(--td-border-level-1-color);
  display: flex;
  flex-direction: column;
  background-color: var(--td-bg-color-secondarycontainer);
  height: calc(100vh - 57px);
  overflow: auto;

  .sidebar-header {
    position: sticky;
    left: 0;
    top: 0;
    padding: 12px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    .t-input {
      flex: 1;
    }
  }

  .platform-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    .platform-item {
      padding: 10px 16px;
      cursor: pointer;
      transition: all 0.2s;
      border-left: 3px solid transparent;

      &:hover {
        background-color: var(--td-bg-color-component-hover);
      }

      &.active {
        background-color: var(--td-brand-color-1);
        border-left-color: var(--td-brand-color);
        color: var(--td-brand-color);
      }

      .platform-name {
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
