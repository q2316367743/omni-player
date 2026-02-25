import type {AiMcpWrapper} from "@/modules/ai/mcp";
import OpenAI from "openai";
import {
  addMemoLayerPersona,
  updateMemoFriendDynamic,
  updateMemoLayerPersona,
  getActiveMemoLayerPersonas
} from "@/services/memo";
import {
  addMemoLayerBehavior,
  updateMemoLayerBehavior,
  getActiveMemoLayerBehaviors,
  setExpireTime as setBehaviorExpireTime,
  extendExpireTime as extendBehaviorExpireTime
} from "@/services/memo/layer/MemoLayerBehaviorService";
import {
  addMemoLayerCognitive,
  updateMemoLayerCognitive,
  getActiveMemoLayerCognitive,
  setExpireTime as setCognitiveExpireTime,
  extendExpireTime as extendCognitiveExpireTime
} from "@/services/memo/layer/MemoLayerCognitiveService";
import {
  addMemoLayerEmotion,
  updateMemoLayerEmotion,
  getActiveMemoLayerEmotions,
  setExpireTime as setEmotionExpireTime,
  extendExpireTime as extendEmotionExpireTime
} from "@/services/memo/layer/MemoLayerEmotionService";
import {
  setExpireTime as setPersonaExpireTime,
  extendExpireTime as extendPersonaExpireTime
} from "@/services/memo/layer/MemoLayerPersonaService";

export class SelfPersonaMcp implements AiMcpWrapper {

  private readonly friendId: string;

  constructor(friendId: string) {
    this.friendId = friendId;
  }

  check(functionName: string): boolean {
    return functionName === 'self_update_friend_dynamic' ||
      functionName === 'self_add_persona' ||
      functionName === 'self_update_persona' ||
      functionName === 'self_get_personas' ||
      functionName === 'self_set_persona_expire' ||
      functionName === 'self_extend_persona_expire' ||
      functionName === 'self_add_behavior' ||
      functionName === 'self_update_behavior' ||
      functionName === 'self_get_behaviors' ||
      functionName === 'self_set_behavior_expire' ||
      functionName === 'self_extend_behavior_expire' ||
      functionName === 'self_add_cognitive' ||
      functionName === 'self_update_cognitive' ||
      functionName === 'self_get_cognitives' ||
      functionName === 'self_set_cognitive_expire' ||
      functionName === 'self_extend_cognitive_expire' ||
      functionName === 'self_add_emotion' ||
      functionName === 'self_update_emotion' ||
      functionName === 'self_get_emotions' ||
      functionName === 'self_set_emotion_expire' ||
      functionName === 'self_extend_emotion_expire';
  }

  async execute(functionName: string, args: any): Promise<any> {
    let result: any;

    switch (functionName) {
      case 'self_update_friend_dynamic':
        await updateMemoFriendDynamic(this.friendId, {
          current_mood: args.mood,
          last_interaction: args.last_interaction
        });
        result = {success: true};
        break;
      case 'self_add_persona':
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
        result = {success: true};
        break;
      case 'self_update_persona':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await updateMemoLayerPersona(args.id, {
            delta: args.delta,
            baseline_trait: args.baseline_trait,
            confidence: args.confidence,
            expire_at: args.expire_at
          });
          result = {success: true};
        }
        break;
      case 'self_get_personas':
        result = {success: true, data: await getActiveMemoLayerPersonas()};
        break;
      case 'self_set_persona_expire':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await setPersonaExpireTime(args.id, args.expire_at);
          result = {success: true};
        }
        break;
      case 'self_extend_persona_expire':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await extendPersonaExpireTime(args.id, args.additional_days);
          result = {success: true};
        }
        break;
      case 'self_add_behavior':
        await addMemoLayerBehavior({
          source: 'chat',
          source_id: this.friendId,
          type: args.type,
          behavior: args.behavior,
          priority: args.priority,
          status: args.status,
          deadline: args.deadline,
          reminder: args.reminder,
          expire_at: args.expire_at
        });
        result = {success: true};
        break;
      case 'self_update_behavior':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await updateMemoLayerBehavior(args.id, {
            type: args.type,
            behavior: args.behavior,
            priority: args.priority,
            status: args.status,
            deadline: args.deadline,
            reminder: args.reminder,
            expire_at: args.expire_at
          });
          result = {success: true};
        }
        break;
      case 'self_get_behaviors':
        result = {success: true, data: await getActiveMemoLayerBehaviors()};
        break;
      case 'self_set_behavior_expire':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await setBehaviorExpireTime(args.id, args.expire_at);
          result = {success: true};
        }
        break;
      case 'self_extend_behavior_expire':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await extendBehaviorExpireTime(args.id, args.additional_days);
          result = {success: true};
        }
        break;
      case 'self_add_cognitive':
        await addMemoLayerCognitive({
          source: 'chat',
          source_id: this.friendId,
          topic: args.topic,
          type: args.type,
          importance: args.importance,
          cognitive_distortion: args.cognitive_distortion,
          expire_at: args.expire_at
        });
        result = {success: true};
        break;
      case 'self_update_cognitive':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await updateMemoLayerCognitive(args.id, {
            topic: args.topic,
            type: args.type,
            importance: args.importance,
            cognitive_distortion: args.cognitive_distortion,
            expire_at: args.expire_at
          });
          result = {success: true};
        }
        break;
      case 'self_get_cognitives':
        result = {success: true, data: await getActiveMemoLayerCognitive()};
        break;
      case 'self_set_cognitive_expire':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await setCognitiveExpireTime(args.id, args.expire_at);
          result = {success: true};
        }
        break;
      case 'self_extend_cognitive_expire':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await extendCognitiveExpireTime(args.id, args.additional_days);
          result = {success: true};
        }
        break;
      case 'self_add_emotion':
        await addMemoLayerEmotion({
          source: 'chat',
          source_id: this.friendId,
          emotion_type: args.emotion_type,
          intensity: args.intensity,
          trigger_topic: args.trigger_topic,
          expire_at: args.expire_at
        });
        result = {success: true};
        break;
      case 'self_update_emotion':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await updateMemoLayerEmotion(args.id, {
            emotion_type: args.emotion_type,
            intensity: args.intensity,
            trigger_topic: args.trigger_topic,
            expire_at: args.expire_at
          });
          result = {success: true};
        }
        break;
      case 'self_get_emotions':
        result = {success: true, data: await getActiveMemoLayerEmotions()};
        break;
      case 'self_set_emotion_expire':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await setEmotionExpireTime(args.id, args.expire_at);
          result = {success: true};
        }
        break;
      case 'self_extend_emotion_expire':
        if (!args.id) {
          result = {success: false, error: 'id is required'};
        } else {
          await extendEmotionExpireTime(args.id, args.additional_days);
          result = {success: true};
        }
        break;
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
      },
      {
        type: "function",
        function: {
          name: "self_get_personas",
          description: "获取所有有效的人格层记录",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_set_persona_expire",
          description: "设置人格层记录的过期时间",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "人格记录ID"},
              expire_at: {type: "integer", description: "过期时间戳（毫秒）"}
            },
            required: ["id", "expire_at"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_extend_persona_expire",
          description: "延长人格层记录的过期时间",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "人格记录ID"},
              additional_days: {type: "integer", description: "延长的天数"}
            },
            required: ["id", "additional_days"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_add_behavior",
          description: "添加新的行为层记录（待办与习惯）",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["todo", "habit_cue", "social_intent", "avoidance", "seeking"],
                description: "行为类型：todo-待办，habit_cue-习惯养成，social_intent-社交意图，avoidance-回避，seeking-寻求"
              },
              behavior: {type: "string", description: "具体的行为描述"},
              priority: {type: "integer", minimum: 0, maximum: 9, description: "优先级 0-9"},
              status: {
                type: "string",
                enum: ["active", "completed", "snoozed", "expired"],
                description: "状态：active-活跃，completed-已完成，snoozed-已推迟，expired-已过期"
              },
              deadline: {type: "integer", description: "截止日期时间戳（毫秒）"},
              reminder: {type: "integer", description: "提醒时间戳（毫秒）"},
              expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
            },
            required: ["type", "behavior", "priority", "status", "deadline", "reminder", "expire_at"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_update_behavior",
          description: "更新现有的行为层记录",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "要更新的行为记录ID"},
              type: {
                type: "string",
                enum: ["todo", "habit_cue", "social_intent", "avoidance", "seeking"],
                description: "行为类型"
              },
              behavior: {type: "string", description: "具体的行为描述"},
              priority: {type: "integer", minimum: 0, maximum: 9, description: "优先级 0-9"},
              status: {
                type: "string",
                enum: ["active", "completed", "snoozed", "expired"],
                description: "状态"
              },
              deadline: {type: "integer", description: "截止日期时间戳（毫秒）"},
              reminder: {type: "integer", description: "提醒时间戳（毫秒）"},
              expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
            },
            required: ["id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_get_behaviors",
          description: "获取所有有效的行为层记录",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_set_behavior_expire",
          description: "设置行为层记录的过期时间",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "行为记录ID"},
              expire_at: {type: "integer", description: "过期时间戳（毫秒）"}
            },
            required: ["id", "expire_at"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_extend_behavior_expire",
          description: "延长行为层记录的过期时间",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "行为记录ID"},
              additional_days: {type: "integer", description: "延长的天数"}
            },
            required: ["id", "additional_days"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_add_cognitive",
          description: "添加新的认知层记录（中期，14-30天有效期）",
          parameters: {
            type: "object",
            properties: {
              topic: {type: "string", description: "核心话题（如'职场公平'）"},
              type: {
                type: "string",
                enum: ["value_conflict", "unsolved_problem", "growth_need", "relationship_issue", "existential"],
                description: "类型：value_conflict-冲突，unsolved_problem-未解决，growth_need-成长需求，relationship_issue-关系问题，existential-存在性"
              },
              importance: {type: "integer", minimum: 0, maximum: 9, description: "重要性 0-9"},
              cognitive_distortion: {type: "string", description: "认知扭曲类型（如'灾难化'、'读心术'）"},
              expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
            },
            required: ["topic", "type", "importance", "cognitive_distortion", "expire_at"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_update_cognitive",
          description: "更新现有的认知层记录",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "要更新的认知记录ID"},
              topic: {type: "string", description: "核心话题"},
              type: {
                type: "string",
                enum: ["value_conflict", "unsolved_problem", "growth_need", "relationship_issue", "existential"],
                description: "类型"
              },
              importance: {type: "integer", minimum: 0, maximum: 9, description: "重要性 0-9"},
              cognitive_distortion: {type: "string", description: "认知扭曲类型"},
              expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
            },
            required: ["id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_get_cognitives",
          description: "获取所有有效的认知层记录",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_set_cognitive_expire",
          description: "设置认知层记录的过期时间",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "认知记录ID"},
              expire_at: {type: "integer", description: "过期时间戳（毫秒）"}
            },
            required: ["id", "expire_at"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_extend_cognitive_expire",
          description: "延长认知层记录的过期时间",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "认知记录ID"},
              additional_days: {type: "integer", description: "延长的天数"}
            },
            required: ["id", "additional_days"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_add_emotion",
          description: "添加新的情绪层记录（短期，3-7天有效期）",
          parameters: {
            type: "object",
            properties: {
              emotion_type: {
                type: "string",
                enum: ["anger", "anxiety", "joy", "sadness", "fear", "disgust", "surprise", "neutral"],
                description: "情绪类型：anger-生气，anxiety-焦虑，joy-开心，sadness-悲伤，fear-害怕，disgust-厌恶，surprise-惊讶，neutral-中立"
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
          name: "self_update_emotion",
          description: "更新现有的情绪层记录",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "要更新的情绪记录ID"},
              emotion_type: {
                type: "string",
                enum: ["anger", "anxiety", "joy", "sadness", "fear", "disgust", "surprise", "neutral"],
                description: "情绪类型"
              },
              intensity: {type: "integer", minimum: 0, maximum: 9, description: "强度 0-9"},
              trigger_topic: {type: "string", description: "触发该情绪的话题"},
              expire_at: {type: "integer", description: "有效期时间戳（毫秒）"}
            },
            required: ["id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_get_emotions",
          description: "获取所有有效的情绪层记录",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_set_emotion_expire",
          description: "设置情绪层记录的过期时间",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "情绪记录ID"},
              expire_at: {type: "integer", description: "过期时间戳（毫秒）"}
            },
            required: ["id", "expire_at"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "self_extend_emotion_expire",
          description: "延长情绪层记录的过期时间",
          parameters: {
            type: "object",
            properties: {
              id: {type: "string", description: "情绪记录ID"},
              additional_days: {type: "integer", description: "延长的天数"}
            },
            required: ["id", "additional_days"]
          }
        }
      }
    ];
  }
}
