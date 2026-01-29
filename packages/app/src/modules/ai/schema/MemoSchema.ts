import OpenAI from "openai";

export const MEMO_TOOL_SCHEMA: Array<OpenAI.Chat.Completions.ChatCompletionTool> = [
  {
    type: "function",
    function: {
      name: "add_behavior",
      description: "添加一个新的行为层记录（待办、习惯线索、社交意图等）",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["todo", "habit_cue", "social_intent", "avoidance", "seeking"],
            description: "行为类型：todo-待办，habit_cue-习惯线索，social_intent-社交意图，avoidance-回避，seeking-寻求"
          },
          behavior: {type: "string", description: "具体的行为描述"},
          priority: {type: "integer", minimum: 0, maximum: 9, description: "优先级 0-9"},
          status: {
            type: "string",
            enum: ["active", "completed", "snoozed", "expired"],
            description: "状态"
          },
          deadline: {type: "integer", description: "截止日期时间戳（毫秒），0表示无截止日期"},
          reminder: {type: "integer", description: "提醒时间戳（毫秒），0表示无提醒"},
          expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
        },
        required: ["type", "behavior", "priority", "status", "expire_at"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_behavior",
      description: "更新现有的行为层记录",
      parameters: {
        type: "object",
        properties: {
          id: {type: "string", description: "要更新的行为记录ID"},
          priority: {type: "integer", minimum: 0, maximum: 9, description: "优先级 0-9"},
          status: {
            type: "string",
            enum: ["active", "completed", "snoozed", "expired"],
            description: "状态"
          },
          deadline: {type: "integer", description: "截止日期时间戳（毫秒），0表示无截止日期"},
          reminder: {type: "integer", description: "提醒时间戳（毫秒），0表示无提醒"},
          expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_emotion",
      description: "添加一个新的情绪层记录",
      parameters: {
        type: "object",
        properties: {
          emotion_type: {
            type: "string",
            enum: ["anger", "anxiety", "joy", "sadness", "fear", "disgust", "surprise", "neutral"],
            description: "情绪类型"
          },
          intensity: {type: "integer", minimum: 0, maximum: 9, description: "强度 0-9"},
          trigger_topic: {type: "string", description: "触发该情绪的话题"},
          expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
        },
        required: ["emotion_type", "intensity", "trigger_topic", "expire_at"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_emotion",
      description: "更新现有的情绪层记录",
      parameters: {
        type: "object",
        properties: {
          id: {type: "string", description: "要更新的情绪记录ID"},
          intensity: {type: "integer", minimum: 0, maximum: 9, description: "强度 0-9"},
          expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_cognitive",
      description: "添加一个新的认知层记录",
      parameters: {
        type: "object",
        properties: {
          topic: {type: "string", description: "核心话题"},
          type: {
            type: "string",
            enum: ["value_conflict", "unsolved_problem", "growth_need", "relationship_issue", "existential"],
            description: "认知类型：value_conflict-冲突，unsolved_problem-未解决，growth_need-成长需求，relationship_issue-关系问题，existential-存在性"
          },
          importance: {type: "integer", minimum: 0, maximum: 9, description: "重要性 0-9"},
          cognitive_distortion: {type: "string", description: "认知扭曲类型（如'灾难化'、'读心术'）"},
          expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
        },
        required: ["topic", "type", "importance", "expire_at"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_cognitive",
      description: "更新现有的认知层记录",
      parameters: {
        type: "object",
        properties: {
          id: {type: "string", description: "要更新的认知记录ID"},
          importance: {type: "integer", minimum: 0, maximum: 9, description: "重要性 0-9"},
          expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
        },
        required: ["id"]
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