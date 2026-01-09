import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 发版项目
 */
export interface ReleaseProject extends BaseEntity {
  /**
   * 项目名称
   */
  name: string;
  /**
   * 项目描述
   */
  desc: string;
}