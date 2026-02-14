import OpenAI from "openai";

export interface AiMcpResult {
  /**
   * 函数名
   */
  functionName: string;
  /**
   * 函数参数
   */
  args: any;
  /**
   * 函数结果
   */
  result: any;
}

export interface AiMcpWrapper {
  // 获取 schema
  getSchema(): Array<OpenAI.Chat.Completions.ChatCompletionTool>;
  check(functionName: string): boolean;
  execute(functionName: string, args: any): Promise<AiMcpResult>;
}