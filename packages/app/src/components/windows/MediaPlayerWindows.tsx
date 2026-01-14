import type {WindowPayload} from "@/lib/windows.ts";
import {DrawerPlugin} from "tdesign-vue-next";
import MediaPlayer from "@/nested/MediaPlayer/MediaPlayer.vue";

export async function openMediaPlayerWindows(payload: WindowPayload) {
  DrawerPlugin({
    header: false,
    className: 'no-padding',
    closeOnOverlayClick: false,
    closeBtn: false,
    closeOnEscKeydown: true,
    destroyOnClose: true,
    footer: false,
    size: '100%',
    default: () => <MediaPlayer itemId={payload.itemId} mediaId={payload.mediaId} serverId={payload.serverId}/>,
  })
}