import type {BaseEntity} from "@/entity/BaseEntity.ts";



export interface SpRoleTimeline extends BaseEntity {
  // 关联角色
  screenplay_id: string;
  role_id: string;

  // === 1. 物理时间轴（用于 AI 理解角色生平和排序） ===

  // 年龄（核心排序依据）
  physical_age: number;
  // 具体年份（可选，用于历史文/修仙文）
  physical_year: number;
  // 具体月份（1-12，可选，用于同年龄排序）
  physical_month: number;
  // 具体日期（1-31，可选）
  physical_day: number;
  /**
   *  精度等级：'age'(仅年龄), 'year', 'month', 'day'
   *  @example year
   */
  precise_level: 'age' | 'year' | 'month' | 'day';

  // === 2. 叙事关联（用于章节管理和回忆/插叙标记） ===

  // 关联章节ID（可选）
  related_chapter_id: string;
  // 关联场景ID（可选，更精细）
  related_scene_id: string;
  // 关系类型：'none'(无/背景), 'active'(发生), 'flashback'(回忆), 'foreshadow'(伏笔)
  relation_type: 'none' | 'active' | 'flashback' | 'foreshadow';

  // === 3. 事件内容 ===

  // 事件类型：'faction_change'(阵营), 'item_get'(物品), 'injury'(受伤), 'growth'(成长) 等
  event_type: 'faction_change' | 'item_get' | 'injury' | 'growth' | string;
  // 事件标题（如：拜师青云门）
  title: string;
  // 详细描述（给 AI 看的上下文）
  description: string;
  // 标签（JSON字符串或逗号分隔，如："关键,主线"）
  tags: string;

  // === 4. 排序与元数据 ===
  // 手动排序权重（解决同年龄/同日期的微调）
  sort_order: number;
  // 软删除标记 (0:正常, 1:删除)
  is_deleted: number;


}