import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {AiChatRole} from "@/global/CommonType.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export interface MemoChat extends BaseEntity {

  // 所属会话
  friend_id: string;
  // 角色
  role: AiChatRole;
  // 内容
  content: string;
  // 0=原始 1=单次总结 2=多次总结压缩
  compression_level: 0 | 1 | 2;
  // 是否已纳入长期总结
  archived: YesOrNo;
}