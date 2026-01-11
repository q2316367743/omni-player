import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseDeployCore {

  /**
   * 所属项目
   */
  project_id: string;

  /**
   * 发版版本
   */
  version_id: string;

  /**
   * 发版实例
   */
  instance_id: string;
}

export interface ReleaseDeploy extends BaseEntity, ReleaseDeployCore {
}