import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 笔记块
 */
export interface MemoChunk extends BaseEntity {

  memo_id: string;

  content: string;
}