export interface CommonOption {
  label: string;
  value: string;
}

/**
 * AI聊天支持的角色
 */
export type AiChatRole = "system" | "user" | "assistant" | "model-change" | "error";