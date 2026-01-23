import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface SpChapterContent extends BaseEntity {
  // 剧本 ID
  screenplay_id: string;
  // 章节 ID
  chapter_id: string;
  // 场景 ID
  scene_id: string;
  // 内容
  content: string;
}