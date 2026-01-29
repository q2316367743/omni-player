import OpenAI from "openai";

export const MEMO_COMMENT_TOOL_SCHEMA: Array<OpenAI.Chat.Completions.ChatCompletionTool> = [
  {
    type: "function",
    function: {
      name: "update_intimacy",
      description: "更新与用户的亲密度（0-100），根据互动内容调整亲密度",
      parameters: {
        type: "object",
        properties: {
          delta: {
            type: "integer",
            minimum: -10,
            maximum: 10,
            description: "亲密度变化量，负数表示降低，正数表示提升，建议范围 -5 到 5"
          },
          reason: {
            type: "string",
            description: "调整原因，如'用户分享了私密话题'、'互动积极'等"
          }
        },
        required: ["delta", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_trust",
      description: "更新对用户的信任度（0-100），根据互动内容调整信任度",
      parameters: {
        type: "object",
        properties: {
          delta: {
            type: "integer",
            minimum: -10,
            maximum: 10,
            description: "信任度变化量，负数表示降低，正数表示提升，建议范围 -5 到 5"
          },
          reason: {
            type: "string",
            description: "调整原因，如'用户坦诚分享'、'保持一致'等"
          }
        },
        required: ["delta", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_mood",
      description: "更新当前情绪状态，AI 也会有情绪变化",
      parameters: {
        type: "object",
        properties: {
          mood: {
            type: "string",
            enum: ["happy", "concerned", "playful", "melancholy", "excited"],
            description: "新的情绪状态"
          },
          duration_hours: {
            type: "integer",
            minimum: 1,
            maximum: 72,
            description: "情绪持续时间（小时），建议 6-24 小时"
          },
          reason: {
            type: "string",
            description: "情绪变化原因，如'用户分享了好消息'、'担心用户的状态'等"
          }
        },
        required: ["mood", "duration_hours", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_milestone",
      description: "添加关系里程碑，记录与用户关系中的重要事件",
      parameters: {
        type: "object",
        properties: {
          event: {
            type: "string",
            description: "事件名称，如'第一次深入交流'、'用户分享秘密'、'共同解决问题'等"
          },
          desc: {
            type: "string",
            description: "事件描述，详细说明这个里程碑的意义"
          }
        },
        required: ["event", "desc"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_unknown_memo_count",
      description: "更新未知 memo 数量，当用户 @ 了其他朋友但没有 @ 自己时可以增加，表示'吃醋'或'好奇'",
      parameters: {
        type: "object",
        properties: {
          delta: {
            type: "integer",
            minimum: 0,
            maximum: 10,
            description: "未知 memo 数量变化量，正数表示增加"
          },
          reason: {
            type: "string",
            description: "调整原因，如'用户 @ 了其他朋友'、'感到被忽视'等"
          }
        },
        required: ["delta", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_conversation_frequency",
      description: "更新互动频率特征描述",
      parameters: {
        type: "object",
        properties: {
          frequency: {
            type: "string",
            description: "互动频率描述，如'每天'、'每周几次'、'偶尔'、'很少'等"
          }
        },
        required: ["frequency"]
      }
    }
  }
];
