import OpenAI from "openai";

export const CHAT_SUMMARY_TOOL_SCHEMA: Array<OpenAI.Chat.Completions.ChatCompletionTool> = [
  {
    type: "function",
    function: {
      name: "create_chat_summary",
      description: "创建聊天记录的总结，包括标题、总结内容和AI小记",
      parameters: {
        type: "object",
        properties: {
          title: {type: "string", description: "聊天记录的标题，10字以内诗意标题"},
          summary: {type: "string", description: "聊天记录的详细总结，150字内，含关键洞察"},
          role_notes: {type: "string", description: "AI小记，第一人称日记，表达共情或反思"}
        },
        required: ["title", "summary", "role_notes"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_friend_dynamic",
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
      name: "add_persona",
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
      name: "update_persona",
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
