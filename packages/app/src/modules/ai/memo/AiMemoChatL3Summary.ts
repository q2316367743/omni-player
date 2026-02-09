import {type MemoChatSummary, type MemoFriendStaticView} from "@/entity/memo";


export interface AiMemoChatL3SummaryProp {
  friend: MemoFriendStaticView;
  l1Summary: Array<MemoChatSummary>;
  l2Summary: Array<MemoChatSummary>;
}

/**
 * 此处是归档总结，也是最核心的总结，此处是基于已经总结的 L1 和 L2 的总结进行提炼为四层人格信息和 ai 情绪变化
 * @return 总结信息
 */
export async function aiMemoChatL3Summary(prop: AiMemoChatL3SummaryProp): Promise<void> {



}