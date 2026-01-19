import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export interface AiRtGroupCore {


  /**
   * 讨论组名称
   */
  name: string;

  /**
   * 最大发言轮数
   * 0 表示无限制
   */
  max_rounds: number;

  /**
   * 每 N 轮后触发上帝AI总结（如设为 3，则第3、6、9轮后总结）
   */
  summary_interval: number;

  /**
   * 会议结束时是否自动触发最终总结
   */
  auto_summary_on_end: YesOrNo;

  /**
   * 用户角色
   */
  user_role: string;
}

/**
 * 圆桌会议 - 讨论组
 */
export interface AiRtGroup extends BaseEntity, AiRtGroupCore {

}