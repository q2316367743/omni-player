import type {AiMcpWrapper} from "@/modules/ai/mcp";
import OpenAI from "openai";
import {listMemoChatSummaryByTimeRange} from "@/services/memo/chat/MemoChatSummaryService.ts";
import {formatDate} from "@/util/lang/DateUtil.ts";

export class SelfSummaryMcp implements AiMcpWrapper {

  private readonly friendId: string;

  constructor(friendId: string) {
    this.friendId = friendId;
  }

  check(functionName: string): boolean {
    return functionName === 'self_query_l1_summaries' ||
      functionName === 'self_query_l2_summaries';
  }

  async execute(functionName: string, args: any): Promise<any> {
    let result: any;

    switch (functionName) {
      case 'self_query_l1_summaries': {
        const startTime = args.start_time || Date.now() - 7 * 24 * 60 * 60 * 1000;
        const endTime = args.end_time || Date.now();
        const summaries = await listMemoChatSummaryByTimeRange(this.friendId, 1, startTime, endTime);
        result = summaries.map(s => ({
          time_range: `${formatDate(s.start_time)} - ${formatDate(s.end_time)}`,
          content: s.content
        }));
        break;
      }
      case 'self_query_l2_summaries': {
        const startTime = args.start_time || Date.now() - 30 * 24 * 60 * 60 * 1000;
        const endTime = args.end_time || Date.now();
        const summaries = await listMemoChatSummaryByTimeRange(this.friendId, 2, startTime, endTime);
        result = summaries.map(s => ({
          time_range: `${formatDate(s.start_time)} - ${formatDate(s.end_time)}`,
          content: s.content,
          ai_journal: s.ai_journal
        }));
        break;
      }
      default:
        return Promise.reject(new Error(`无效的函数名：${functionName}`));
    }

    return {functionName, args, result};
  }

  getSchema(): Array<OpenAI.Chat.Completions.ChatCompletionTool> {
    return [
      {
        type: "function",
        function: {
          name: "self_query_l1_summaries",
          description: "查询指定时间范围内的 L1 聊天总结（阶段性短总结）。L1 总结是对短期对话的压缩索引，包含关系/情感、核心事实、行动建议。",
          parameters: {
            type: "object",
            properties: {
              start_time: {type: "integer", description: "查询开始时间戳（毫秒），不传则默认为7天前"},
              end_time: {type: "integer", description: "查询结束时间戳（毫秒），不传则默认为当前时间"}
            },
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_query_l2_summaries",
          description: "查询指定时间范围内的 L2 聊天总结（主题长总结）。L2 总结是对长期对话的深度分析，包含变化趋势、核心议题、成长轨迹和AI小记。",
          parameters: {
            type: "object",
            properties: {
              start_time: {type: "integer", description: "查询开始时间戳（毫秒），不传则默认为30天前"},
              end_time: {type: "integer", description: "查询结束时间戳（毫秒），不传则默认为当前时间"}
            },
            required: []
          }
        }
      }
    ];
  }
}
