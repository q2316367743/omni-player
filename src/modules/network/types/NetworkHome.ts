import type {NetworkRecommend} from "@/modules/network/types/NetworkRecommend.ts";
import type {NetworkPageResult} from "@/modules/network/types/NetworkPageResult.ts";
import type {NetworkCategory} from "@/modules/network/types/NetworkCategory.ts";

export interface NetworkHome extends NetworkPageResult {
  // 推荐
  recommends: Array<NetworkRecommend>;
  // 分类
  categories: Array<NetworkCategory>;
}