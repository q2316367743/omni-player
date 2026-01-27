export interface AskToOpenAiAbort {
  abort: (reason?: string) => void;
}

export interface ChatMessageParam {
  // 角色
  role: "system" | "user" | "assistant";
  // 内容
  content: string;
}

interface Assistant {
  // 使用的默认模型
  model: string;
  // 模型温度，0-2，一位小数
  temperature?: number;
  // Top-P，0-1，二位小数
  topP?: number;
  // 上下文数
  maxChats?: number;
}

export interface AskToOpenAiProps {
  messages: Array<ChatMessageParam>;
  assistant: Assistant;
  think?: boolean;
  // 流式处理回调开始
  onStart?: () => void;
  // 流式处理回调
  onAppend: (data: string, t?: boolean) => void;
  // 流式处理回调结束
  onAborted: (a: AskToOpenAiAbort) => void;
}

export interface AiQuestionResult {
  think: string;
  content: string;
}