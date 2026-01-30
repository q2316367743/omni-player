import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface MemoChatSummaryCore {

  session_id: string;

  friend_id: string;

  /**
   * 标题（给用户看），10 字以内诗意标题，如《雨夜谈孤独》
   */
  title: string;
  /**
   * 总结信息，150 字内，含关键洞察，客观摘要，含情绪变化、核心议题
   */
  summary: string;
  /**
   * JSON: {"main_worry":"job", "mood_shift":"anxious→hopeful"}
   */
  key_insights: string;
  /**
   * AI 小记（给心留痕），AI 第一人称日记，表达共情或反思
   */
  ai_journal: string;
}

export interface MemoChatSummary extends BaseEntity, MemoChatSummaryCore {
}