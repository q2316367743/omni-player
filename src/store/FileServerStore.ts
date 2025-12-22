import {defineStore} from "pinia";
import {useStore} from "@/lib/store.ts";
import {LocalName} from "@/global/LocalName.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useSnowflake} from "@/util";
import {useFileStronghold} from "@/lib/Stronghold.ts";
import {createFileClient} from "@/modules/file/factory.ts";
import type {FileServer, FileServerEdit} from "@/entity/FileServer.ts";
import type {IFileServer} from "@/modules/file/IFileServer.ts";

export const fetchMediaClient = async (id: string) => {
  const servers = await useStore().list(LocalName.LIST_FILE_SERVER);
  const index = servers.findIndex(s => s.id === id);
  if (index >= 0) {
    const server = servers[index]!;
    // 获取用户名和密码
    const [username, password] = await Promise.all([
      useFileStronghold().getFileRecord(id, "username"),
      useFileStronghold().getFileRecord(id, "password")
    ])
    const client = createFileClient({...server, username, password});
    await client.connect();
    return client;
  } else {
    throw new Error("媒体服务器不存在");
  }
}

export const useMediaServerStore = defineStore('media-server', () => {

  const servers = ref(new Array<FileServer>());
  const serverClientMap = new Map<string, IFileServer>();

  useStore().list(LocalName.LIST_MEDIA_SERVER).then((res) => {
    servers.value = res;
    console.log("初始化媒体服务器列表成功")
  }).catch((e) => MessageUtil.error("初始化媒体服务器列表失败", e));

  const addServer = async (res: FileServerEdit) => {
    const {username, password, ...other} = res;
    const server = {
      id: useSnowflake().nextId(),
      created_at: Date.now(),
      updated_at: Date.now(),
      ...other
    };
    servers.value.push(server);
    await useStore().save(LocalName.LIST_MEDIA_SERVER, servers.value);
    // 保存用户名密码
    await useFileStronghold().setFileRecord(server.id, "username", username);
    await useFileStronghold().setFileRecord(server.id, "password", password);
  }

  const removeServer = async (server: FileServer) => {
    servers.value = servers.value.filter(s => s.id !== server.id);
    await useStore().save(LocalName.LIST_MEDIA_SERVER, servers.value);
    // 删除用户名密码
    await useFileStronghold().removeFileRecord(server.id, "username");
    await useFileStronghold().removeFileRecord(server.id, "password");
    serverClientMap.delete(server.id);
  }

  const updateServer = async (server: FileServerEdit, id: string) => {
    const {username, password, ...other} = server;
    const index = servers.value.findIndex(s => s.id === id);
    servers.value[index] = {
      ...servers.value[index]!,
      ...other,
      updated_at: Date.now(),
    };
    await useStore().save(LocalName.LIST_MEDIA_SERVER, servers.value);
    // 更新用户名密码
    await useFileStronghold().setFileRecord(id, "username", username);
    await useFileStronghold().setFileRecord(id, "password", password);
    serverClientMap.delete(id);
  }

  const getServerClient = async (id: string): Promise<IFileServer> => {
    const client = serverClientMap.get(id);
    if (client) return client;
    const index = servers.value.findIndex(s => s.id === id);
    if (index >= 0) {
      const server = servers.value[index]!;
      // 获取用户名和密码
      const [username, password] = await Promise.all([
        useFileStronghold().getFileRecord(id, "username"),
        useFileStronghold().getFileRecord(id, "password")
      ])
      const client = createFileClient({...server, username, password});
      await client.connect();
      serverClientMap.set(id, client);
      return client;
    } else {
      throw new Error("媒体服务器不存在");
    }
  }

  const removeServerClient = (id: string) => {
    serverClientMap.delete(id);
  }

  return {
    servers,
    addServer,
    updateServer,
    removeServer,
    getServerClient,
    removeServerClient
  }

})
