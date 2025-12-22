<template>
  <div class="file-home">
    <div class="header">
      <div class="left-actions">
        <t-button variant="text" shape="circle" @click="goUp" :disabled="currentPath === '/'">
          <template #icon><t-icon name="arrow-left" /></template>
        </t-button>
        <t-breadcrumb class="breadcrumb">
          <t-breadcrumb-item @click="fetchList('/')" style="cursor: pointer">
            <t-icon name="home" />
          </t-breadcrumb-item>
          <t-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="item.path"
            @click="fetchList(item.path)"
            style="cursor: pointer"
          >
            {{ item.name }}
          </t-breadcrumb-item>
        </t-breadcrumb>
      </div>
      
      <div class="right-actions">
        <t-radio-group variant="default-filled" v-model="viewMode">
          <t-radio-button value="table">
            <template #icon><t-icon name="view-list" /></template>
          </t-radio-button>
          <t-radio-button value="grid">
             <template #icon><t-icon name="view-module" /></template>
          </t-radio-button>
        </t-radio-group>
      </div>
    </div>

    <div class="content">
      <t-loading :loading="loading" show-overlay size="small" style="height: 100%">
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid-view">
          <div 
            v-for="item in list" 
            :key="item.path" 
            class="grid-item"
            @click="handleItemClick(item)"
          >
            <div class="icon-wrapper">
              <div v-if="getPoster(item)" class="poster-wrapper">
                 <img :src="getPoster(item)" class="poster-img" loading="lazy" />
              </div>
              <template v-else>
                <t-icon v-if="item.isDirectory" name="folder" class="file-icon folder" />
                <t-icon v-else-if="isVideo(item)" name="video" class="file-icon video" />
                <t-icon v-else name="file" class="file-icon file" />
              </template>
            </div>
            <div class="item-info">
              <div class="item-name" :title="item.name">{{ item.name }}</div>
              <div class="item-meta" v-if="!item.isDirectory">{{ formatBytes(item.size) }}</div>
            </div>
          </div>
          <div v-if="list.length === 0" class="empty-state">
             <t-empty />
          </div>
        </div>

        <!-- Table View -->
        <div v-else class="table-container">
          <t-table
            :data="list"
            :columns="columns"
            row-key="path"
            :pagination="undefined"
            @row-click="({ row }) => handleItemClick(row as FileItem)"
            hover
            height="calc(100vh - 130px)"
            :max-height="undefined"
          >
            <template #icon="{ row }">
              <t-icon v-if="row.isDirectory" name="folder" class="table-icon folder" />
              <t-icon v-else-if="isVideo(row)" name="video" class="table-icon video" />
              <t-icon v-else name="file" class="table-icon file" />
            </template>
            <template #size="{ row }">
              <span v-if="!row.isDirectory">{{ formatBytes(row.size) }}</span>
            </template>
            <template #modifiedAt="{ row }">
              {{ formatTime(row.modifiedAt) }}
            </template>
          </t-table>
        </div>
      </t-loading>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { MessagePlugin } from "tdesign-vue-next";
import type { IFileServer } from "@/modules/file/IFileServer.ts";
import { useFileServerStore } from "@/store";
import type { FileItem } from "@/modules/file/types/FileItem.ts";
import { SUPPORT_MOVIE } from "@/global/Constants.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {createWindows} from "@/lib/windows.ts";

const route = useRoute();
const clientId = route.params.id as string;

const loading = ref(false);
const list = ref<FileItem[]>([]);
const currentPath = ref("/");
const viewMode = ref<'table' | 'grid'>('table');
const posterMap = ref<Record<string, string>>({}); // path -> url

let client: IFileServer | null = null;

const columns = [
  { colKey: "icon", title: "", width: 40, cell: "icon" },
  { colKey: "name", title: "名称", ellipsis: true },
  { colKey: "size", title: "大小", width: 120, cell: "size" },
  { colKey: "modifiedAt", title: "修改时间", width: 200, cell: "modifiedAt" },
];

const breadcrumbs = computed(() => {
  if (currentPath.value === "/") return [];
  const parts = currentPath.value.split("/").filter(Boolean);
  let accumulatedPath = "";
  return parts.map((part) => {
    accumulatedPath += "/" + part;
    return {
      name: part,
      path: accumulatedPath,
    };
  });
});

const isVideo = (file: FileItem) => {
  return SUPPORT_MOVIE.test(file.extname || "");
};

const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatTime = (time?: string) => {
  if (!time) return "-";
  try {
    return new Date(time).toLocaleString();
  } catch {
    return time;
  }
};

const fetchList = async (path: string) => {
  if (!client) return;
  try {
    loading.value = true;
    posterMap.value = {}; // Clear posters on directory change
    const res = await client.list(path);
    console.log(res)
    list.value = res.content || [];
    currentPath.value = path;
    
    // Load posters asynchronously
    loadPosters(list.value);
  } catch (e: any) {
    MessageUtil.error(`加载失败: ${e.message}`);
  } finally {
    loading.value = false;
  }
};

const loadPosters = async (items: FileItem[]) => {
  if (!client) return;
  
  for (const item of items) {
    if (!item.subtitles?.length) continue;
    
    // Check for poster in subtitles
    const posterSub = item.subtitles.find(sub => sub.type === 'poster');
    if (posterSub) {
      try {
        // Construct a temporary FileItem to get the URL
        const url = await client.getPlayableUrl({
          id: posterSub.path,
          path: posterSub.path,
          name: '',
          basename: '',
          extname: '',
          isDirectory: false
        });
        posterMap.value[item.path] = url;
      } catch (e) {
        // ignore
      }
    }
  }
};

const getPoster = (item: FileItem) => {
  return posterMap.value[item.path];
};

const goUp = () => {
  if (currentPath.value === '/') return;
  const parts = currentPath.value.split('/').filter(Boolean);
  parts.pop();
  const parent = '/' + parts.join('/');
  fetchList(parent);
};

const handleItemClick = async (row: FileItem) => {
  if (row.isDirectory) {
    await fetchList(row.path);
  } else if (client?.isPlayable(row)) {
    try {
      await createWindows('file', {
        title: row.name,
        serverId: clientId,
        mediaId: row.id,
        itemId: row.path,
        file: row
      });
    } catch (e: any) {
      MessagePlugin.error(`打开播放窗口失败: ${e.message}`);
    }
  } else {
    MessagePlugin.info("该文件不支持播放");
  }
};

onMounted(async () => {
  try {
    client = await useFileServerStore().getServerClient(clientId);
    await fetchList("/");
  } catch (e: any) {
    MessageUtil.error(`初始化失败: ${e.message}`);
  }
});
</script>

<style scoped lang="less">
.file-home {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  background-color: var(--td-bg-color-page);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 8px 16px;
    background: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    box-shadow: var(--td-shadow-1);

    .left-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;

      .breadcrumb {
        flex: 1;
        overflow: hidden;
      }
    }
  }

  .content {
    flex: 1;
    overflow: hidden;
    background: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    padding: 0;
    box-shadow: var(--td-shadow-1);
    position: relative;
    display: flex;
    flex-direction: column;
  }
}

.table-container {
  flex: 1;
  overflow: auto;
  height: 100%;
}

.table-icon {
  font-size: 18px;
  &.folder { color: var(--td-warning-color); }
  &.video { color: var(--td-brand-color); }
  &.file { color: var(--td-text-color-secondary); }
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-auto-rows: min-content;
  gap: 16px;
  overflow-y: auto;
  height: 100%;
  padding-bottom: 20px;

  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    border-radius: var(--td-radius-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    border: 1px solid transparent;

    &:hover {
      background-color: var(--td-bg-color-secondarycontainer);
      border-color: var(--td-component-border);
    }

    .icon-wrapper {
      margin-bottom: 8px;
      width: 100%;
      height: 64px;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .file-icon {
        font-size: 48px;
        &.folder { color: var(--td-warning-color); }
        &.video { color: var(--td-brand-color); }
        &.file { color: var(--td-text-color-secondary); }
      }

      .poster-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius: 4px;

        .poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .item-info {
      width: 100%;
      
      .item-name {
        font-size: 14px;
        color: var(--td-text-color-primary);
        margin-bottom: 4px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-all;
        line-height: 1.4;
      }

      .item-meta {
        font-size: 12px;
        color: var(--td-text-color-placeholder);
      }
    }
  }

  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}
</style>