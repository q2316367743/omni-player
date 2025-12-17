import type {NetworkListItemUrl} from "@/modules/network/types/NetworkListItemUrl.ts";

export interface NetworkListItemChapter {
  id: string;
  name: string;
  items: Array<NetworkListItemUrl>;
}