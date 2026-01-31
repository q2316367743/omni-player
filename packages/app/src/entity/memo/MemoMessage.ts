import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {AiChatRole} from "@/global/CommonType.ts";

export interface MemoMessageCore {

  // 所属会话
  session_id: string;
  // 角色
  role: AiChatRole | 'summary';
  // 内容
  content: string;

}

export interface MemoMessage extends BaseEntity, MemoMessageCore {

}