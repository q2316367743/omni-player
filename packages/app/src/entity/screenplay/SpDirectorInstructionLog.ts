import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export type SpDilInstruction = 'character_slip' | 'reveal_item' | 'external_event' | 'skip_turn' | 'trigger_emotion'

export interface SpDirectorInstructionLogCore {
  // 剧本ID
  screenplay_id: string;
  // 场景ID
  scene_id: string;
  /**
   * 指令
   * | 指令类型 | 参数 | 效果 |
   * |--------|------|------|
   * | `character_slip` | `target_role_id`, `content` | 强制角色说出指定台词（视为“失言”） |
   * | `reveal_item` | `item_desc`, `discoverer_id` | 插入物品发现事件（如“口红盖有字”） |
   * | `external_event` | `description` | 插入环境事件（警笛、停电、敲门） |
   * | `skip_turn` | `role_id` | 跳过某角色本轮发言 |
   * | `trigger_emotion` | `role_id`, `emotion`, `delta` | 强制修改情绪（如“大峰突然愤怒+30”） |
   */
  instruction: SpDilInstruction;
  /**
   * 参数
   * @example {"target_role_id": "xx", "content": ""}
   */
  params: string;
  /**
   * 是否已经生效
   */
  is_active: YesOrNo;

}

/**
 * 导演指令日志表
 */
export interface SpDirectorInstructionLog extends BaseEntity, SpDirectorInstructionLogCore {

  /**
   * 从哪条对话开始生效
   */
  dialogue_id: string;
}