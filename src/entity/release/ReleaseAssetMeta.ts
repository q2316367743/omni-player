import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseAssetMeta extends BaseEntity {

  /**
   * 所属项目
   */
  project_id: string;

  /**
   * 作用域
   */
  scope: 'version' | 'instance';

  /**
   * 作用域ID
   */
  scope_id: string;

  /**
   * 相对于根目录的路径
   * @example sql/init.sql
   */
  relative_path: string;

  /**
   * 文件名
   */
  file_name: string;

  /**
   * 文件类型
   *
   * - document: markdown 文档
   * - sql: sql 文件
   * - other: 其他文件
   */
  file_type: 'document' | 'sql' | 'other';

}