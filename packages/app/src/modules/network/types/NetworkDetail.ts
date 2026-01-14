import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";

export interface NetworkDetail extends NetworkListItem {
  recommends: Array<NetworkListItem>;
}