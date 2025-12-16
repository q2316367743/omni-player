import type {MediaServer} from "@/entity/MediaServer.ts";
import type {IMediaServer} from "@/media/IMediaServer.ts";
import {JellyfinClient} from "@/media/services/jellyfin/JellyfinClient.ts";

export function createMediaClient(server: MediaServer): IMediaServer {
  if (server.type === 'jellyfin') {
    return new JellyfinClient(server);
  }
  throw new Error(`Unsupported media server type: ${server.type}`);
}