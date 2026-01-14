import type {WindowLabel, WindowPayload} from "@/lib/windows.ts";
import {openMediaPlayerWindows} from "@/components/windows/MediaPlayerWindows.tsx";
import {openNetworkPlayerWindows} from "@/components/windows/NetworkPlayerWindows.tsx";

export async function createUtoolsWindows(label: WindowLabel, payload: WindowPayload) {
  if (label === 'media') {
    await openMediaPlayerWindows(payload);
  } else if (label === 'network') {
    await openNetworkPlayerWindows(payload);
  }
}