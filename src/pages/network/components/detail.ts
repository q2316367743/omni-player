import type { NetworkListItem } from "@/modules/network/types/NetworkListItem";

let res: NetworkListItem | null = null;

export function setNetworkListItem(detail: NetworkListItem) {
  res = detail;
}

export function getNetworkListItem(): NetworkListItem {
  return res!;
}
