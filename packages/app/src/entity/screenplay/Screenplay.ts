import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ScreenplayCore {

  /**
   * 剧本标题
   */
  title: string;
  /**
   * 背景故事
   */
  background: string;
  /**
   * 剧本标签
   */
  tags: string;

}

export interface ScreenplayCoreView {

  /**
   * 剧本标题
   */
  title: string;
  /**
   * 背景故事
   */
  background: string;
  /**
   * 视图
   */
  tags: Array<string>;
}


/**
 * 剧本
 */
export interface Screenplay extends BaseEntity, ScreenplayCore {
}

export interface ScreenplayView extends BaseEntity, ScreenplayCoreView {
}