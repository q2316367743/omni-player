import type {AiMcpWrapper} from "@/modules/ai/mcp";
import OpenAI from "openai";
import {
  addMemoLayerPersona,
  updateMemoFriendDynamic,
  updateMemoLayerPersona
} from "@/services/memo";

export class SelfMcp implements AiMcpWrapper {

  private readonly friendId: string;

  private  toolHandlers: Record<string, (args: any) => Promise<void>> = {
    self_update_friend_dynamic: async (args: any) => {
      await updateMemoFriendDynamic(this.friendId, {
        current_mood: args.mood,
        last_interaction: args.last_interaction
      });
    },
    self_add_persona: async (args: any) => {
      await addMemoLayerPersona({
        source: 'chat',
        source_id: this.friendId,
        trait_name: args.trait_name,
        delta: args.delta,
        baseline_trait: args.baseline_trait,
        confidence: args.confidence,
        evidence_snippet: args.evidence_snippet || '',
        expire_at: args.expire_at
      });
    },
    self_update_persona: async (args: any) => {
      if (!args.id) return;
      await updateMemoLayerPersona(args.id, {
        delta: args.delta,
        baseline_trait: args.baseline_trait,
        confidence: args.confidence,
        expire_at: args.expire_at
      });
    }
  };

  constructor(friendId: string) {
    this.friendId = friendId;
  }


  check(functionName: string): boolean {
    return functionName.startsWith('self');
  }

  async execute(functionName: string, args: any): Promise<any> {
    const handler = this.toolHandlers[functionName];
    if (handler) {
      return handler(args);
    }
    return Promise.reject(new Error(`无效的函数名：${functionName}`));
  }

  getSchema(): Array<OpenAI.Chat.Completions.ChatCompletionTool> {
    return [
      {
        type: "function",
        function: {
          name: "self_update_friend_dynamic",
          description: "更新 AI 角色自己的动态数据",
          parameters: {
            type: "object",
            properties: {
              friend_id: {type: "string", description: "AI 角色的 ID"},
              mood: {
                type: "string",
                enum: ["happy", "concerned", "playful", "melancholy", "excited"],
                description: "AI 角色的当前心情"
              },
              last_interaction: {type: "integer", description: "最后交互时间戳（毫秒）"}
            },
            required: ["friend_id", "mood", "last_interaction"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_add_persona",
          description: "添加新的人格层记录",
          parameters: {
            type: "object",
            properties: {
              trait_name: {
                type: "string",
                enum: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "resilience", "curiosity", "optimism"],
                description: "特征名称：openness-开放性，conscientiousness-尽责性，extraversion-外向性，agreeableness-友好的性，neuroticism-神经过敏性，resilience-弹性，curiosity-好奇心，optimism-乐观"
              },
              delta: {type: "integer", minimum: 0, maximum: 99, description: "单位变化量 0-99"},
              baseline_trait: {type: "integer", minimum: 0, maximum: 100, description: "用户该特质的基线水平 0-100"},
              confidence: {type: "integer", minimum: 0, maximum: 99, description: "置信度 0-99"},
              evidence_snippet: {type: "string", description: "证据原文片段"},
              expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
            },
            required: ["trait_name", "delta", "baseline_trait", "confidence", "expire_at"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_update_persona",
          description: "更新现有的人格层记录",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "要更新的人格记录ID"},
              delta: {type: "integer", minimum: 0, maximum: 99, description: "单位变化量 0-99"},
              baseline_trait: {type: "integer", minimum: 0, maximum: 100, description: "用户该特质的基线水平 0-100"},
              confidence: {type: "integer", minimum: 0, maximum: 99, description: "置信度 0-99"},
              expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
            },
            required: ["id"]
          }
        }
      }
    ];
  }

}