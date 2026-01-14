import type {MediaServer} from "@/entity/MediaServer.ts";
import type {IMediaServer} from "@/modules/media/IMediaServer.ts";
import {JellyfinClient} from "@/modules/media/services/jellyfin/JellyfinClient.ts";
import {EmbyClient} from "@/modules/media/services/emby/EmbyClient.ts";
import {PlexClient} from "@/modules/media/services/plex/PlexClient.ts";

export function createMediaClient(server: MediaServer): IMediaServer {
  if (server.type === 'jellyfin') {
    return new JellyfinClient(server);
  } else if (server.type === 'emby') {
    return new EmbyClient(server);
  } else if (server.type === 'plex') {
    return new PlexClient(server);
  }
  throw new Error(`Unsupported media server type: ${server.type}`);
}