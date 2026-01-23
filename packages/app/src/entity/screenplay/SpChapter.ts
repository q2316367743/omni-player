import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface SpChapterCore {

  screenplay_id: string;

  /**
   * 章节名称
   */
  title: string;

  /**
   * 章节描述/大致剧情
   */
  description: string;
}

/**
 * 剧本章节
 */
export interface SpChapter extends BaseEntity, SpChapterCore {

  /**
   * 章节索引，从 1 开始
   */
  index: number;

}