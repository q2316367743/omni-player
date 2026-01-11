import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseVersionCore {
  version: string;
  deploy_time: number;
  deploy_user: string;
}

/**
 * 版本表
 */
export interface ReleaseVersion extends BaseEntity, ReleaseVersionCore {

  /**
   * 所属项目
   */
  project_id: string;

}