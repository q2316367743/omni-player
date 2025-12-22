<template>
  <page-layout title="首页" subtitle="配置并进入你的媒体、网络与文件服务">
    <div class="mx-auto max-w-7xl p-4 md:p-6 space-y-8">
      <section>
        <div class="flex items-end justify-between gap-4">
          <div class="min-w-0">
            <div class="text-lg font-semibold leading-6">媒体</div>
            <div class="mt-1 text-sm" style="color: var(--td-text-color-secondary)">
              已配置 {{ medias.length }} 个媒体服务器
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="media in medias"
            :key="media.id"
            class="group rounded-2xl border border-solid p-4 cursor-pointer transition-shadow hover:shadow-md"
            style="border-color: var(--td-border-level-1-color); background: var(--td-bg-color-container)"
            @click="jumpMedia(media.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style="background: var(--td-bg-color-secondarycontainer)"
                >
                  <component
                    :is="getMediaIcon(media.type)"
                    width="28"
                    height="28"
                  />
                </div>
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ media.name }}</div>
                  <div class="mt-1 text-xs truncate" style="color: var(--td-text-color-secondary)">{{ media.url }}</div>
                </div>
              </div>
              <div class="shrink-0 flex items-center gap-2">
                <t-tag v-if="!media.isEnabled" theme="warning" size="small" variant="light">已停用</t-tag>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-end gap-2">
              <t-button theme="default" variant="text" @click.stop="jumpMedia(media.id)">进入</t-button>
              <t-button theme="primary" variant="text" @click.stop="openMediaServerEdit(media)">编辑</t-button>
              <t-button theme="danger" variant="text" @click.stop="openMediaServerRemove(media)">删除</t-button>
            </div>
          </div>

          <div
            class="rounded-2xl border border-dashed p-4 flex items-center justify-center cursor-pointer"
            style="border-color: var(--td-border-level-1-color); background: var(--td-bg-color-container)"
            @click="openMediaServerEdit()"
          >
            <div class="text-sm" style="color: var(--td-text-color-secondary)">新增媒体服务器</div>
          </div>
        </div>
      </section>

      <section>
        <div class="flex items-end justify-between gap-4">
          <div class="min-w-0">
            <div class="text-lg font-semibold leading-6">网络</div>
            <div class="mt-1 text-sm" style="color: var(--td-text-color-secondary)">
              已配置 {{ networks.length }} 个网络服务源
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="network in networks"
            :key="network.id"
            class="group rounded-2xl border border-solid p-4 cursor-pointer transition-shadow hover:shadow-md"
            style="border-color: var(--td-border-level-1-color); background: var(--td-bg-color-container)"
            @click="jumpNetwork(network.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="h-10 w-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                  :style="
                    network.format === 'json'
                      ? 'background: linear-gradient(135deg, var(--td-brand-color-light) 0%, var(--td-brand-color-light-hover) 100%); color: var(--td-brand-color)'
                      : 'background: linear-gradient(135deg, var(--td-success-color-light) 0%, var(--td-success-color-light-hover) 100%); color: var(--td-success-color)'
                  "
                >
                  <template v-if="network.format === 'json'">
                    <div class="text-[13px] leading-3 font-mono font-semibold">{}</div>
                    <div class="mt-1 text-[9px] leading-3 font-semibold tracking-wide">JSON</div>
                  </template>
                  <template v-else>
                    <div class="text-[13px] leading-3 font-mono font-semibold">&lt;/&gt;</div>
                    <div class="mt-1 text-[9px] leading-3 font-semibold tracking-wide">XML</div>
                  </template>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ network.name }}</div>
                  <div class="mt-1 text-xs truncate" style="color: var(--td-text-color-secondary)">{{
                      network.url
                    }}
                  </div>
                </div>
              </div>
              <div class="shrink-0 flex flex-col items-end gap-2">
                <t-tag theme="primary" size="small" variant="outline">{{ NetworkServerTypeLabel[network.type] }}</t-tag>
                <t-tag v-if="network.group" theme="primary" size="small" variant="light">{{ network.group }}</t-tag>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-end gap-2">
              <t-button theme="default" variant="text" @click.stop="jumpNetwork(network.id)">进入</t-button>
              <t-button theme="primary" variant="text" @click.stop="openNetworkServerEdit(network)">编辑</t-button>
              <t-button theme="danger" variant="text" @click.stop="openNetworkServerRemove(network)">删除</t-button>
            </div>
          </div>

          <div
            class="rounded-2xl border border-dashed p-4 flex items-center justify-center cursor-pointer"
            style="border-color: var(--td-border-level-1-color); background: var(--td-bg-color-container)"
            @click="openNetworkServerEdit()"
          >
            <div class="text-sm" style="color: var(--td-text-color-secondary)">新增网络服务</div>
          </div>
        </div>
      </section>

      <section>
        <div class="flex items-end justify-between gap-4">
          <div class="min-w-0">
            <div class="text-lg font-semibold leading-6">文件</div>
            <div class="mt-1 text-sm" style="color: var(--td-text-color-secondary)">
              已配置 {{ files.length }} 个文件服务器
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="file in files"
            :key="file.id"
            class="group rounded-2xl border border-solid p-4 cursor-pointer transition-shadow hover:shadow-md"
            style="border-color: var(--td-border-level-1-color); background: var(--td-bg-color-container)"
            @click="jumpFile(file.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="h-10 w-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                  style="background: var(--td-bg-color-secondarycontainer)"
                >
                  <div class="text-[13px] leading-3 font-mono font-semibold">FS</div>
                  <div class="mt-1 text-[9px] leading-3 font-semibold tracking-wide truncate max-w-[40px]">
                    {{ FileServerTypeLabel[file.type] }}
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ file.name }}</div>
                  <div class="mt-1 text-xs truncate" style="color: var(--td-text-color-secondary)">{{ file.url }}</div>
                </div>
              </div>
              <div class="shrink-0 flex items-center gap-2">
                <t-tag theme="primary" size="small" variant="outline">{{ FileServerTypeLabel[file.type] }}</t-tag>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-end gap-2">
              <t-button theme="default" variant="text" @click.stop="jumpFile(file.id)">进入</t-button>
              <t-button theme="primary" variant="text" @click.stop="openFileServerEdit(file)">编辑</t-button>
              <t-button theme="danger" variant="text" @click.stop="openFileServerRemove(file)">删除</t-button>
            </div>
          </div>

          <div
            class="rounded-2xl border border-dashed p-4 flex items-center justify-center cursor-pointer"
            style="border-color: var(--td-border-level-1-color); background: var(--td-bg-color-container)"
            @click="openFileServerEdit()"
          >
            <div class="text-sm" style="color: var(--td-text-color-secondary)">新增文件服务器</div>
          </div>
        </div>
      </section>
    </div>
  </page-layout>
</template>
<script lang="ts" setup>
import {useFileServerStore, useMediaServerStore, useNetworkServerStore} from "@/store";
import {openMediaServerEdit} from "@/pages/home/func/MediaServerEdit";
import type {MediaServer, MediaServerType} from "@/entity/MediaServer";
import MessageBoxUtil from "@/util/model/MessageBoxUtil";
import MessageUtil from "@/util/model/MessageUtil";
import {openNetworkServerEdit} from "@/pages/home/func/NetworkServerEdit";
import {type NetworkServer, NetworkServerTypeLabel} from "@/entity/NetworkServer";
import JellyfinIcon from "@/modules/icon/JellyfinIcon.vue";
import EmbyIcon from "@/modules/icon/EmbyIcon.vue";
import PlexIcon from "@/modules/icon/PlexIcon.vue";
import {openFileServerEdit} from "@/pages/home/func/FileServerEdit";
import {type FileServer, FileServerTypeLabel} from "@/entity/FileServer";

const router = useRouter();

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

const files = computed(() => {
  return [...useFileServerStore().servers].sort((a, b) => a.name.localeCompare(b.name));
});

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

const openMediaServerRemove = (server: MediaServer) => {
  MessageBoxUtil.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
  }).then(() => {
    useMediaServerStore().removeServer(server)
      .then(() => MessageUtil.success("删除成功"))
      .catch((e) => MessageUtil.error("删除失败", e))
  })
}

const jumpMedia = (id: string) => {
  router.push(`/media/${id}/home`)
}

const jumpNetwork = (id: string) => {
  router.push(`/network/${id}/home`)
}

const jumpFile = (id: string) => {
  router.push(`/file/${id}/home`)
}

const openNetworkServerRemove = (server: NetworkServer) => {
  MessageBoxUtil.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
  }).then(() => {
    useNetworkServerStore().removeServer(server)
      .then(() => MessageUtil.success("删除成功"))
      .catch((e) => MessageUtil.error("删除失败", e))
  })
}

const openFileServerRemove = (server: FileServer) => {
  MessageBoxUtil.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
  }).then(() => {
    useFileServerStore().removeServer(server)
      .then(() => MessageUtil.success("删除成功"))
      .catch((e) => MessageUtil.error("删除失败", e))
  })
}
</script>
