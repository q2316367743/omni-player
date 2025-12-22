import type {FileServerEntry} from "@/entity/FileServer.ts";
import type {IFileServer} from "@/modules/file/IFileServer.ts";
import {OpenListClient} from "@/modules/file/services/open-list/OpenListClient.ts";

export function createFileClient(server: FileServerEntry): IFileServer {
  switch (server.type) {
    case "OPEN_LIST":
      return new OpenListClient(server);
  }
  throw new Error(`文件服务「${server.type}」不存在`);
}