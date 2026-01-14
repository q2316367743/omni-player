import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface AiChatGroupCore {

  // 名称
  name: string;
  // 提示词
  prompt: string;
  // 使用的模型，这里是默认模型，在真正聊天时可以自己修改
  model: string;
  // 排序
  sort: number;

}

/**
 * AI 分组
 */
export interface AiChatGroup extends BaseEntity, AiChatGroupCore {
}