import type {NetworkPageResult} from "@/modules/network/types/NetworkPageResult.ts";
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";

export interface NetworkCommonResult extends NetworkPageResult{
  data: Array<NetworkListItem>;
}