import type {FileItem} from "@/modules/file/types/FileItem.ts";

export interface ListResult {

  content: FileItem[];
  /**
   * Total number of items
   */
  total: number;

  extra?: Record<string, unknown>;
}