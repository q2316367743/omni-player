import type {WindowPayload} from "@/lib/windows.ts";
import {DrawerPlugin} from "tdesign-vue-next";
import NetworkPlayer from "@/nested/NetworkPlayer/NetworkPlayer.vue";

export async function openNetworkPlayerWindows(payload: WindowPayload) {
  DrawerPlugin({
    header: false,
    className: 'no-padding',
    closeOnOverlayClick: false,
    closeBtn: false,
    closeOnEscKeydown: true,
    destroyOnClose: true,
    footer: false,
    size: '100%',
    default: () => <NetworkPlayer item={payload.item!} serverId={payload.serverId}/>,
  })
}