import {defineStore} from "pinia";
import {useStore} from "@/lib/store.ts";
import {LocalName} from "@/global/LocalName.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useSnowflake} from "@/util";
import type {NetworkServer, NetworkServerEdit} from "@/entity/NetworkServer.ts";
import type {INetworkServer} from "@/modules/network/INetworkServer.ts";
import {createNetworkServer} from "@/modules/network/factory.ts";

export const fetchNetworkClient = async (id: string) => {
  const servers = await useStore().list(LocalName.LIST_NETWORK_SERVER);
  const index = servers.findIndex(s => s.id === id);
  if (index >= 0) {
    const server = servers[index]!;
    return createNetworkServer(server);
  } else {
    throw new Error("网络服务器不存在");
  }
}

export const useNetworkServerStore = defineStore('network-server', () => {

  const servers = ref(new Array<NetworkServer>());
  const serverClientMap = new Map<string, INetworkServer>();

  useStore().list(LocalName.LIST_NETWORK_SERVER).then((res) => {
    servers.value = res;
    console.log("初始化媒体服务器列表成功")
  }).catch((e) => MessageUtil.error("初始化媒体服务器列表失败", e));

  const addServer = async (res: NetworkServerEdit) => {
    const server = {
      id: useSnowflake().nextId(),
      created_at: Date.now(),
      updated_at: Date.now(),
      ...res
    };
    servers.value.push(server);
    await useStore().save(LocalName.LIST_NETWORK_SERVER, servers.value);
  }

  const removeServer = async (server: NetworkServer) => {
    servers.value = servers.value.filter(s => s.id !== server.id);
    await useStore().save(LocalName.LIST_NETWORK_SERVER, servers.value);
    serverClientMap.delete(server.id);
  }

  const updateServer = async (res: NetworkServerEdit, id: string) => {
    const index = servers.value.findIndex(s => s.id === id);
    servers.value[index] = {
      ...servers.value[index]!,
      ...res,
      updated_at: Date.now(),
    };
    await useStore().save(LocalName.LIST_NETWORK_SERVER, servers.value);
    serverClientMap.delete(id);
  }

  const getServerClient = async (id: string): Promise<INetworkServer> => {
    const client = serverClientMap.get(id);
    if (client) return client;
    const index = servers.value.findIndex(s => s.id === id);
    if (index >= 0) {
      const server = servers.value[index]!;
      const client = createNetworkServer(server);
      serverClientMap.set(id, client);
      return client;
    } else {
      throw new Error("媒体服务器不存在");
    }

  }

  return {
    servers,
    addServer,
    updateServer,
    removeServer,
    getServerClient
  }

})