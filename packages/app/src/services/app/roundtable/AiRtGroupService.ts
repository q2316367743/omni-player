import type {AiRtGroup} from "@/entity/app/ai/roundtable";
import {useSql} from "@/lib/sql.ts";

/**
 * 获取圆桌会议讨论组列表
 */
export async function listAiRtGroupService() {
  return useSql().query<AiRtGroup>('ai_rt_group').list();
}