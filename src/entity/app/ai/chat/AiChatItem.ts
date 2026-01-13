import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface AiChatItemCore {
  // 所属分组，默认为空
  group_id: string;

  // 名称
  name: string;

  // 是否置顶
  top: number;

  // 排序
  sort: number;
}

export interface AiChatItem extends BaseEntity, AiChatItemCore {

}