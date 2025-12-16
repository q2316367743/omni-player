import {defineStore} from "pinia";
import type {MediaServer, MediaServerEdit} from "@/entity/MediaServer.ts";
import {useStore} from "@/lib/store.ts";
import {LocalName} from "@/global/LocalName.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useSnowflake} from "@/util";
import {useStronghold} from "@/lib/Stronghold.ts";

export const useMediaServerStore = defineStore('media-server', () => {

  const servers = ref(new Array<MediaServer>());

  useStore().list(LocalName.LIST_MEDIA_SERVER).then((res) => {
    servers.value = res;
  }).catch((e) => MessageUtil.error("初始化媒体服务器列表失败", e));

  const addServer = async (res: MediaServerEdit) => {
    const {username, password, ...other} = res;
    const server = {
      id: useSnowflake().nextId(),
      created_at: Date.now(),
      updated_at: Date.now(),
      ...other
    };
    servers.value.push();
    await useStore().save(LocalName.LIST_MEDIA_SERVER, servers.value);
    // 保存用户名密码
    await useStronghold().setMediaRecord(server.id, "username", username);
    await useStronghold().setMediaRecord(server.id, "password", password);
  }

  const removeServer = async (server: MediaServer) => {
    servers.value = servers.value.filter(s => s.id !== server.id);
    await useStore().save(LocalName.LIST_MEDIA_SERVER, servers.value);
    // 删除用户名密码
    await useStronghold().removeMediaRecord(server.id, "username");
    await useStronghold().removeMediaRecord(server.id, "password");
  }

  const updateServer = async (server: MediaServerEdit, id: string) => {
    const {username, password, ...other} = server;
    const index = servers.value.findIndex(s => s.id === id);
    servers.value[index] = {
      ...servers.value[index]!,
      ...other,
    };
    await useStore().save(LocalName.LIST_MEDIA_SERVER, servers.value);
    // 更新用户名密码
    await useStronghold().setMediaRecord(id, "username", username);
    await useStronghold().setMediaRecord(id, "password", password);
  }

  return {
    servers,
    addServer,
    updateServer,
    removeServer
  }

})