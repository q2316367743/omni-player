import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseAssetContent extends BaseEntity {

  /**
   * 所属项目
   */
  project_id: string;

  /**
   * 当是其他时有效
   */
  language: string;

  /**
   * 内容
   */
  content: string;

}