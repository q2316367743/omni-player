<template>
  <div>
    <h1>媒体</h1>
    <t-list>
      <t-list-item v-for="media in medias" :key="media.id">
        <t-link theme="primary" @click="jumpMedia(media.id)">{{ media.name }}</t-link>
        <template #action>
          <t-button theme="primary" variant="text" @click="openMediaServerEdit(media)">编辑</t-button>
          <t-button theme="danger" variant="text" @click="openMediaServerRemove(media)">删除</t-button>
        </template>
      </t-list-item>
    </t-list>
    <t-button @click="openMediaServerEdit()">新增</t-button>
    <h1>网络</h1>
    <t-list>
      <t-list-item v-for="network in networks" :key="network.id">
        <t-link theme="primary" @click="jumpNetwork(network.id)">{{ network.name }}</t-link>
        <template #action>
          <t-button theme="primary" variant="text" @click="openNetworkServerEdit(network)">编辑</t-button>
          <t-button theme="danger" variant="text" @click="openNetworkServerEdit(network)">删除</t-button>
        </template>
      </t-list-item>
    </t-list>
    <t-button @click="openNetworkServerEdit()">新增</t-button>
  </div>
</template>
<script lang="ts" setup>
import {useMediaServerStore} from "@/store";
import {openMediaServerEdit} from "@/pages/home/func/MediaServerEdit.tsx";
import type {MediaServer} from "@/entity/MediaServer.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useNetworkServerStore} from "@/store/NetworkServerStore.ts";
import {openNetworkServerEdit} from "@/pages/home/func/NetworkServerEdit.tsx";

const router = useRouter();

const medias = computed(() => useMediaServerStore().servers);
const networks = computed(() => useNetworkServerStore().servers);

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
</script>
<style scoped lang="less">

</style>
