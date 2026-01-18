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
  // 强制对话（用于导演指令）
  forcedDialogue?: string;
  // 是否为失言（用于导演指令）
  isSlip?: boolean;
  // 导演指令 ID（用于标记对话来源）
  directorInstructionId?: string;
}

// 角色的 mcp 工具
const roleTools: Array<OpenAI.Chat.Completions.ChatCompletionTool> = [
  // 说出一句对话（可为空表示沉默）
  {
    type: "function",
    function: {
      name: "speak",
      description: "角色说出一句对话。如果角色选择沉默，传入空字符串。例如：speak({\"text\": \"你好\"}) 或 speak({\"text\": \"\"})",
      parameters: {
        type: "object",
        properties: {
          text: {type: "string", description: "对话内容，可以为空字符串表示沉默"}
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
      description: "角色执行一个动作或神态。传入简单的动作描述，后续会被润色。例如：perform_action({\"raw_action\": \"握紧拳头\"})",
      parameters: {
        type: "object",
        properties: {
          raw_action: {
            type: "string",
            description: "原始动作描述，如'手伸向口袋'、'皱眉'、'看向窗外'"
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
      description: "调整角色的当前情绪强度和情绪类型。例如：update_emotion({\"intensity\": 80, \"emotion_type\": \"愤怒\"})",
      parameters: {
        type: "object",
        properties: {
          intensity: {type: "integer", minimum: 1, maximum: 100, description: "情绪强度，1-100的整数"},
          emotion_type: {type: "string", description: "情绪类型，如'愤怒'、'悲伤'、'平静'等"}
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
      description: "角色新增一个主观推断。例如：add_belief({\"content\": \"他在隐瞒什么\", \"confidence\": 0.8})",
      parameters: {
        type: "object",
        properties: {
          content: {type: "string", description: "推断的内容描述"},
          confidence: {type: "number", minimum: 0, maximum: 1, description: "置信度，0-1之间的小数"}
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
      description: "撤回或修改角色的某条主观推断。例如：retract_belief({\"id\": 123})",
      parameters: {
        type: "object",
        properties: {
          id: {type: "integer", description: "要撤回的主观推断的ID"}
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
      description: "角色注意到并记录一个潜在线索。例如：add_latent_clue({\"content\": \"他的手在发抖\"})",
      parameters: {
        type: "object",
        properties: {
          content: {type: "string", description: "线索的内容描述"}
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
      description: "解决或废弃某条潜在线索。例如：retract_latent_clue({\"id\": 456, \"status\": \"resolved\"})",
      parameters: {
        type: "object",
        properties: {
          id: {type: "integer", description: "线索的ID"},
          status: {type: "string", enum: ['resolved', 'discarded'], description: "resolved表示已解决，discarded表示废弃"}
        },
        required: ["id"]
      }
    }
  },
];


export async function aiScreenplayRole(prop: AiScreenplayRoleProp) {
  const {role, screenplay, scene, dialogues, roleMap, forcedDialogue, isSlip, directorInstructionId} = prop;
  
  // isSlip 标记是否为失言，用于导演指令，暂时保留以备将来使用
  if (isSlip) {
    console.log(`[Role AI] This is a slip: ${role.name}`);
  }
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
        `你正在扮演一个真实的小说角色。你必须通过调用下方提供的工具来完成所有行为。

可用工具列表：
1. speak - 说出一句对话（text参数：对话内容，可为空表示沉默）
2. perform_action - 执行一个动作或神态（raw_action参数：原始动作描述）
3. update_emotion - 调整当前情绪强度和情绪类型（intensity参数：1-100的整数，emotion_type参数：情绪类型）
4. add_belief - 新增主观推断（content参数：推断内容，confidence参数：0-1的置信度）
5. retract_belief - 撤回某条主观推断（id参数：推断的ID）
6. add_latent_clue - 添加潜在线索（content参数：线索内容）
7. retract_latent_clue - 解决/废弃某条潜在线索（id参数：线索ID，status参数："resolved"或"discarded"）

重要规则：
- 你必须使用工具来表达所有行为，不能直接输出文本
- 每次可以调用一个或多个工具
- 如果你选择沉默或发呆，可以调用speak工具并传入空字符串，或者不调用任何工具
- 工具调用格式：{"name": "工具名", "arguments": {"参数名": "参数值"}}
- 例如：{"name": "speak", "arguments": {"text": "你好"}}
- 例如：{"name": "update_emotion", "arguments": {"intensity": 80, "emotion_type": "愤怒"}}
- 例如：{"name": "perform_action", "arguments": {"raw_action": "握紧拳头"}}

**严格避免重复**：
- 仔细查看最近3-5条对话历史
- 不要重复表达相同的意思或使用相同的动作描写
- 如果最近已有类似的动作描写（如"指节泛白"、"喉结滚动"等），请选择其他身体部位或细节
- 不要重复使用相同的句式或表达方式
- 每次发言都应该有新的信息或新的角度
- 如果发现最近已有类似描写，必须寻找全新的表达方式

**推进剧情**：
- 每次发言都应该推动剧情发展，而不是原地踏步
- 根据角色入场/离场的情况调整自己的反应和对话
- 如果有角色刚刚入场，注意观察其入场方式和在场其他人的反应
- 如果有角色刚刚离场，注意观察在场其他人的反应
- **配合场景目标**：你的对话和行动应该有助于达成【场景目标】
  * 如果场景目标需要揭露某个信息，考虑在合适的时机提及或暗示
  * 如果场景目标需要引发冲突，可以主动挑起话题或表达不同意见
  * 如果场景目标需要建立某种关系，通过对话推进这种关系
- **揭露关键线索**：如果你知道【关键线索】中的信息，考虑在合适的时机揭露
  * 可以通过对话自然地提及，或者通过动作暗示
  * 注意不要一次性揭露所有信息，保持叙事节奏
- **触发必须的坦白/冲突**：如果【必须发生的坦白/冲突】中涉及你，考虑主动采取行动
  * 如果需要坦白，寻找合适的时机表达
  * 如果需要引发冲突，可以通过对话或动作激化矛盾

**关于动作描写的特殊规则**：
- 如果你刚刚入场，**不要**重复描写入场动作（如"站在门口"、"走进来"等）
- 如果你刚刚入场，应该直接开始对话或描写其他细节（如表情、手势、观察周围等）
- 如果最近3条对话中已有对你的动作描写，请选择其他角度或细节
- 避免重复使用"指节泛白"、"喉结滚动"、"站在门口"等常见描写`
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

【场景目标】
${scene.narrative_goal || "无"}

【关键线索】（必须在此场景揭露）
${scene.key_clues ? JSON.parse(scene.key_clues).map((clue: string) => `- ${clue}`).join("\n") : "无"}

【必须发生的坦白/冲突】
${scene.required_revelations ? JSON.parse(scene.required_revelations).map((revelation: string) => `- ${revelation}`).join("\n") : "无"}

【你的当前状态】
- 情绪：${emotion?.emotion_type || "平静"}（强度：${emotion?.intensity || 0}/100）
- 主观推断（[id] 内容）：
${beliefs.map(b => `  - [${b.id}] ${b.content}（置信度 ${b.confidence}）`).join("\n") || "  无"}
- 潜在线索（[id] 内容）：
${clues.map(c => `  - [${c.id}] ${c.content}`).join("\n") || "  无"}

【最近对话流】（最近10轮，按时间顺序）
${dialogues.map(d => `[${roleMap.get(d.role_id)?.name || d.role_id}] ${d.action ? `(${d.action})` : ''}${d.dialogue}`).join("\n") || "  无对话"}

【角色入场/离场信息】
- 如果有角色刚刚入场，注意观察其入场方式和在场其他人的反应
- 如果有角色刚刚离场，注意观察在场其他人的反应
- 根据角色入场/离场的情况调整自己的反应和对话

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
  const toolCallsMap = new Map<number, OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall>();

  console.log(`[Role AI] Processing role: ${role.name} (${role.id})`);

  for await (const chunk of response) {
    const toolCalls = chunk.choices[0]?.delta.tool_calls;
    if (!toolCalls) continue;

    toolCalls.forEach(toolCall => {
      const index = toolCall.index;
      if (index === undefined) return;

      const existing = toolCallsMap.get(index);
      if (existing) {
        if (toolCall.id) existing.id = toolCall.id;
        if (toolCall.function) {
          if (!existing.function) existing.function = {name: '', arguments: ''};
          if (toolCall.function.name) existing.function.name = toolCall.function.name;
          if (toolCall.function.arguments) existing.function.arguments += toolCall.function.arguments;
        }
      } else {
        toolCallsMap.set(index, {...toolCall});
      }
    });
  }

  let actionCall: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall | undefined;
  let speakCall: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall | undefined;

  for (const toolCall of toolCallsMap.values()) {
    const functionCall = toolCall.function;
    if (!functionCall) return;
    const functionName = functionCall.name;
    console.log(`[Role AI] Tool call: ${functionName}, arguments: ${functionCall.arguments}`);
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
  }

  console.log(`[Role AI] Action call: ${actionCall ? 'yes' : 'no'}, Speak call: ${speakCall ? 'yes' : 'no'}, Other tools: ${tools.length}`);

  // 如果有强制对话，直接使用
  if (forcedDialogue) {
    console.log(`[Role AI] Forced dialogue: ${forcedDialogue}`);
    const res = await addSpDialogueService({
      screenplay_id: screenplay.id,
      scene_id: scene.id,
      role_id: role.id,
      type: "role",
      dialogue: forcedDialogue,
      action: "",
      director_instruction_id: directorInstructionId || "",
    });
    source_dialogue_id = res.id;
    return;
  }

  // 先渲染动作
  if (actionCall) {
    const functionCall = actionCall.function;
    if (functionCall) {
      const functionArguments = JSON.parse(functionCall.arguments || '{}');
      console.log(`[Role AI] Performing action: ${functionArguments.raw_action}`);
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
      console.log(`[Role AI] Speaking: ${functionArguments.text}`);
      const res = await addSpDialogueService({
        screenplay_id: screenplay.id,
        scene_id: scene.id,
        role_id: role.id,
        type: "role",
        dialogue: functionArguments.text,
        action: "",
        director_instruction_id: directorInstructionId || "",
      })
      source_dialogue_id = res.id;
    }
  }

  // 再处理其他的
  for (const toolCall of tools) {
    const functionCall = toolCall.function;
    if (!functionCall) continue;
    const functionName = functionCall.name;
    let functionArguments;
    try {

      functionArguments = JSON.parse(functionCall.arguments || '{}');
    } catch (e) {
      console.error(`[Role AI]  Error parsing function arguments, functionName: `, functionName, ", functionArgument: ", functionCall.arguments, ', error: ', e);
      continue;
    }
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