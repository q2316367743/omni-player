import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface SpLogCore {
  /**
   * 剧本 ID
   */
  screenplay_id: string;
  /**
   * 角色 ID，可能是某角色产生的日志
   */
  role_id: string;
  /**
   * 日志级别
   */
  level: 'info' | 'error';
  /**
   * 日志内容
   */
  content: string;
}

/**
 * 剧本日志表
 */
export interface SpLog extends BaseEntity, SpLogCore {
}