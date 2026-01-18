import type {Screenplay, SpDialogue, SpRole, SpRoleLatentClueStatus, SpScene} from "@/entity/screenplay";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import OpenAI from "openai";
import {
  addSpDialogueService, addSpRoleBeliefService, addSpRoleLatentClueService,
  getSpRoleEmotionService,
  listSpRoleBeliefService,
  listSpRoleLatentClueService, retractSpRoleBeliefService, retractSpRoleLatentClueService, updateSpRoleEmotionService
} from "@/services/screenplay";
import {askAiScreenplayNarrator} from "@/modules/ai/AiScreenplayNarrator.ts";

export interface AiScreenplayRoleProp {
  // 叙述者 AI
  narrator: SpRole;
  // 自己 AI
  role: SpRole;
  // 剧本
  screenplay: Screenplay;
  // 当前场景
  scene: SpScene;
  // 最近 3 条对话
  dialogues: Array<SpDialogue>;
  // 角色 Map
  roleMap: Map<string, SpRole>;
  // 在场角色
  roles: Array<SpRole>;
}

// 角色的 mcp 工具
const roleTools: Array<OpenAI.Chat.Completions.ChatCompletionTool> = [
  // 说出一句对话（可为空表示沉默）
  {
    type: "function",
    function: {
      name: "speak",
      description: "说出一句对话（可为空表示沉默）",
      parameters: {
        type: "object",
        properties: {
          text: {type: "string", description: "对话内容，可为空"}
        },
        required: ["text"]
      }
    }
  },
  // 执行一个动作或神态（将由 Narrator AI 润色）
  {
    type: "function",
    function: {
      name: "perform_action",
      description: "执行一个动作或神态（将由 Narrator AI 润色）",
      parameters: {
        type: "object",
        properties: {
          raw_action: {
            type: "string",
            description: "原始动作描述，如'手伸向口袋'"
          }
        },
        required: ["raw_action"]
      }
    }
  },
  // 调整当前情绪强度
  {
    type: "function",
    function: {
      name: "update_emotion",
      description: "调整当前情绪强度和情绪类型",
      parameters: {
        type: "object",
        properties: {
          intensity: {type: "integer", minimum: 1, maximum: 100},
          emotion_type: {type: "string"}
        },
        required: ["intensity"]
      }
    }
  },
  // 新增主观推断
  {
    type: "function",
    function: {
      name: "add_belief",
      description: "新增主观推断",
      parameters: {
        type: "object",
        properties: {
          content: {type: "string"},
          confidence: {type: "number", minimum: 0, maximum: 1}
        },
        required: ["content", "confidence"]
      }
    }
  },
  // 撤回某条主观推断
  {
    type: "function",
    function: {
      name: "retract_belief",
      description: "撤回某条主观推断",
      parameters: {
        type: "object",
        properties: {
          id: {type: "integer"}
        },
        required: ["id"]
      }
    }
  },
  // 添加潜在线索
  {
    type: "function",
    function: {
      name: "add_latent_clue",
      description: "添加潜在线索",
      parameters: {
        type: "object",
        properties: {
          content: {type: "string"}
        },
        required: ["content"]
      }
    }
  },
  // 撤回潜在线索
  {
    type: "function",
    function: {
      name: "retract_latent_clue",
      description: "解决/废弃某条主观推断",
      parameters: {
        type: "object",
        properties: {
          id: {type: "integer"},
          status: {type: "string", enum: ['resolved', 'discarded']}
        },
        required: ["id"]
      }
    }
  },
];


export async function aiScreenplayRole(prop: AiScreenplayRoleProp) {
  const {role, screenplay, scene, dialogues, roleMap} = prop;
  const [emotion, beliefs, clues] = await Promise.all([
    // 获取心情
    getSpRoleEmotionService(screenplay.id, role.id),
    // 获取主观推断
    listSpRoleBeliefService(screenplay.id, role.id, 1),
    // 获取潜在线索
    listSpRoleLatentClueService(screenplay.id, role.id, 'active')
  ]);
  const {aiSetting} = useSettingStore();
  const openAi = new OpenAI({
    baseURL: aiSetting.url,
    apiKey: aiSetting.key,
    dangerouslyAllowBrowser: true
  });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    // —————— SYSTEM PROMPT ——————
    {
      role: "system",
      content:
        `你正在扮演一个真实的小说角色。你的一切行为都必须通过调用下方提供的工具来完成。

你可以选择：
- 说出一句对话（使用 speak）
- 执行一个动作或神态（使用 perform_action）
- 更新你的情绪状态（update_emotion）
- 添加/撤回你的主观推断（add_belief / retract_belief）
- 记录你注意到的细节（add_latent_clue）

你也可以选择不调用任何工具——这表示你当前没有外显行为（如发呆、观察、思考）。

不要输出任何其他文本、解释或描述。`
    },

    // —————— USER CONTEXT ——————
    {
      role: "user",
      content:
        `【角色身份】
姓名：${role.name}
身份：${role.identity}
性格：${role.personality}
秘密：${role.secret_info || "无"}

【剧本背景】
${screenplay.background}

【当前场景】
地点：${scene.name}
描述：${scene.description}

【你的当前状态】
- 情绪：${emotion?.emotion_type || "平静"}（强度：${emotion?.intensity || 0}/100）
- 主观推断（[id] 内容）：
${beliefs.map(b => `  - [${b.id}] ${b.content}（置信度 ${b.confidence}）`).join("\n") || "  无"}
- 潜在线索（[id] 内容）：
${clues.map(c => `  - [${c.id}] ${c.content}`).join("\n") || "  无"}

【最近对话流】（最新在前）
${dialogues.map(d => `[${roleMap.get(d.role_id)?.name || d.role_id}] “${d.dialogue}”`).join("\n") || "  无对话"}

请根据以上信息，决定是否调用工具。`
    }
  ];

  const response = await openAi.chat?.completions.create({
    model: role.model,
    messages: messages,
    tools: roleTools,
    tool_choice: "auto", // 或 "required" 如果强制必须调用
    stream: true,
    // temperature: assistant.temperature,
    // top_p: assistant.topP,
    // top_logprobs: assistant.maxChats,
  });

  let source_dialogue_id = '';
  const updateEmotion = (intensity: number, emotion_type?: string) => {
    if (!emotion) return;
    updateSpRoleEmotionService(emotion.id, {
      intensity: intensity,
      emotion_type: emotion_type,
    });
  };
  const addBelief = (content: string, confidence: number) => {
    addSpRoleBeliefService({
      screenplay_id: screenplay.id,
      role_id: role.id,
      content: content,
      confidence: confidence,
      source_dialogue_id: source_dialogue_id,
      is_active: 1
    });
  };
  const retractBelief = (id: string) => {
    retractSpRoleBeliefService(id);
  }
  const addLatentClue = (content: string) => {
    addSpRoleLatentClueService({
      screenplay_id: screenplay.id,
      role_id: role.id,
      content: content,
      status: 'active',
      source_dialogue_id: source_dialogue_id,
      scene_id: scene.id
    });
  };
  const retractLatentClue = (id: string, status: SpRoleLatentClueStatus) => {
    retractSpRoleLatentClueService(id, status);
  };

  const tools = new Array<OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall>();
  let actionCall: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall | undefined;
  let speakCall: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall | undefined;

  for await (const chunk of response) {
    // 工具调用：状态变更指令
    const toolCalls = chunk.choices[0]?.delta.tool_calls;
    // → 例如：
    if (!toolCalls) continue;
    toolCalls.forEach(toolCall => {
      const functionCall = toolCall.function;
      if (!functionCall) return;
      const functionName = functionCall.name;
      switch (functionName) {
        case 'speak':
          speakCall = toolCall;
          break;
        case 'perform_action':
          actionCall = toolCall;
          break;
        default:
          tools.push(toolCall);
      }
    })
  }

  // 先渲染动作
  if (actionCall) {
    const functionCall = actionCall.function;
    if (functionCall) {
      const functionArguments = JSON.parse(functionCall.arguments || '{}');
      await askAiScreenplayNarrator({
        ...prop,
        task: 'describe_action',
        triggerReason: functionArguments.raw_action,
      });
    }
  }
  // 再渲染对话
  if (speakCall) {
    const functionCall = speakCall.function;
    if (functionCall) {
      const functionArguments = JSON.parse(functionCall.arguments || '{}');
      const res = await addSpDialogueService({
        screenplay_id: screenplay.id,
        scene_id: scene.id,
        role_id: role.id,
        type: "role",
        dialogue: functionArguments.content,
        action: "",
      })
      source_dialogue_id = res.id;
    }
  }

  // 再处理其他的
  for (const toolCall of tools) {
    const functionCall = toolCall.function;
    if (!functionCall) continue;
    const functionName = functionCall.name;
    const functionArguments = JSON.parse(functionCall.arguments || '{}');
    switch (functionName) {
      case 'update_emotion':
        updateEmotion(functionArguments.intensity, functionArguments.emotion_type);
        break;
      case 'add_belief':
        addBelief(functionArguments.content, functionArguments.confidence);
        break;
      case 'retract_belief':
        retractBelief(functionArguments.id);
        break;
      case 'add_latent_clue':
        addLatentClue(functionArguments.content);
        break;
      case 'retract_latent_clue':
        retractLatentClue(functionArguments.id, functionArguments.status);
        break;
    }
  }
}