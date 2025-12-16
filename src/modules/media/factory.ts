import type {MediaServer} from "@/entity/MediaServer.ts";
import type {IMediaServer} from "@/modules/media/IMediaServer.ts";
import {JellyfinClient} from "@/modules/media/services/jellyfin/JellyfinClient.ts";

export function createMediaClient(server: MediaServer): IMediaServer {
  if (server.type === 'jellyfin') {
    return new JellyfinClient(server);
  }
  throw new Error(`Unsupported media server type: ${server.type}`);
}