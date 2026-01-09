import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 版本表
 */
export interface ReleaseVersion extends BaseEntity {

  /**
   * 所属项目
   */
  project_id: string;

  /**
   * 版本
   */
  version: string;

  /**
   * 部署时间
   */
  deploy_time: number;

  /**
   * 部署人
   */
  deploy_user: string;

}