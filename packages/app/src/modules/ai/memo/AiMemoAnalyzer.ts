import OpenAI from "openai";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {
  addMemoLayerBehavior,
  getActiveMemoLayerBehaviors,
  updateMemoLayerBehavior,
  addMemoLayerCognitive,
  getActiveMemoLayerCognitive,
  updateMemoLayerCognitive,
  addMemoLayerEmotion,
  getActiveMemoLayerEmotions,
  updateMemoLayerEmotion,
  addMemoLayerPersona,
  getActiveMemoLayerPersonas,
  updateMemoLayerPersona
} from "@/services/memo";
import {MEMO_TOOL_SCHEMA} from "@/modules/ai/schema/MemoSchema.ts";
import type {MemoLayerSource} from "@/entity/memo";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import {logDebug} from "@/lib/log.ts";

export interface AiMemoAnalyzerProp {
  memoContent: string;
  source: MemoLayerSource;
  sourceId: string;
}

export async function aiMemoAnalyzer(prop: AiMemoAnalyzerProp) {
  logDebug('[AiMemoAnalyzer] 开始进行 memo 的 AI 分析')
  const {memoContent, source, sourceId} = prop;

  const [behaviors, emotions, cognitives, personas] = await Promise.all([
    getActiveMemoLayerBehaviors(),
    getActiveMemoLayerEmotions(),
    getActiveMemoLayerCognitive(),
    getActiveMemoLayerPersonas()
  ]);

  const {aiSetting} = useSettingStore();
  const openAi = new OpenAI({
    baseURL: aiSetting.url,
    apiKey: aiSetting.key,
    dangerouslyAllowBrowser: true
  });

  const now = Date.now();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        `你是一个专业的心理分析助手，负责分析用户的 memo 内容并更新其四层心理模型。

四层心理模型说明：
1. 行为层（7-14天有效期）：待办事项、习惯线索、社交意图、回避行为、寻求行为
2. 情绪层（3-7天有效期）：当前情绪状态，包括情绪类型和强度
3. 认知层（14-30天有效期）：核心认知话题、认知扭曲、价值观冲突等
4. 人格层（长期累积）：基于大五人格模型的特质变化，包括开放性、尽责性、外向性、友好的性、神经过敏性、弹性、好奇心、乐观

可用工具列表：
1. add_behavior - 添加新的行为层记录
2. update_behavior - 更新现有行为层记录
3. add_emotion - 添加新的情绪层记录
4. update_emotion - 更新现有情绪层记录
5. add_cognitive - 添加新的认知层记录
6. update_cognitive - 更新现有认知层记录
7. add_persona - 添加新的人格层记录
8. update_persona - 更新现有的人格层记录

重要规则：
- 仔细分析 memo 内容，识别其中的行为、情绪、认知和人格特质信息
- 优先更新现有记录（如果相关），再考虑添加新记录
- 根据各层的有效期特点设置合适的 expire_at 时间戳
  * 行为层：7-14天（now + 7*24*60*60*1000 到 now + 14*24*60*60*1000）
  * 情绪层：3-7天（now + 3*24*60*60*1000 到 now + 7*24*60*60*1000）
  * 认知层：14-30天（now + 14*24*60*60*1000 到 now + 30*24*60*60*1000）
  * 人格层：长期累积（now + 90*24*60*60*1000 或更长）
- 所有时间戳使用毫秒为单位
- 优先级、重要性、强度等数值范围为 0-9
- 置信度范围为 0-99
- delta 和 baseline_trait 范围为 0-100
- 如果 memo 中没有相关信息，可以不调用任何工具`
    },
    {
      role: "user",
      content:
        `【当前时间】
${formatDate(now)}

【Memo 内容】
${memoContent}

【现有行为层记录】
${behaviors.length > 0 ? behaviors.map(b => `  [${b.id}] 类型:${b.type}, 行为:${b.behavior}, 优先级:${b.priority}, 状态:${b.status}`).join("\n") : "  无"}

【现有情绪层记录】
${emotions.length > 0 ? emotions.map(e => `  [${e.id}] 类型:${e.emotion_type}, 强度:${e.intensity}, 触发话题:${e.trigger_topic}`).join("\n") : "  无"}

【现有认知层记录】
${cognitives.length > 0 ? cognitives.map(c => `  [${c.id}] 话题:${c.topic}, 类型:${c.type}, 重要性:${c.importance}, 认知扭曲:${c.cognitive_distortion || "无"}`).join("\n") : "  无"}

【现有人格层记录】
${personas.length > 0 ? personas.map(p => `  [${p.id}] 特质:${p.trait_name}, 变化量:${p.delta}, 基线:${p.baseline_trait}, 置信度:${p.confidence}`).join("\n") : "  无"}

请根据以上信息，分析 memo 内容并调用相应的工具更新四层心理模型。`
    }
  ];

  logDebug('[AiMemoAnalyzer] 开始调用 OpenAI API')
  const response = await openAi.chat?.completions.create({
    model: aiSetting.memoAnalyzerModel,
    messages: messages,
    tools: MEMO_TOOL_SCHEMA,
    tool_choice: "auto",
    stream: true
  });

  const toolCallsMap = new Map<number, OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall>();

  logDebug('[AiMemoAnalyzer] 开始处理 OpenAI API 返回的流数据')
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

  for (const toolCall of toolCallsMap.values()) {
    const functionCall = toolCall.function;
    if (!functionCall) continue;
    const functionName = functionCall.name;
    let functionArguments;
    try {
      functionArguments = JSON.parse(functionCall.arguments || '{}');
    } catch (e) {
      console.error(`[Memo AI] Error parsing function arguments, functionName: ${functionName}, arguments: ${functionCall.arguments}, error: ${e}`);
      continue;
    }

    const commonData = {
      source: source,
      source_id: sourceId
    };

    logDebug(`[Memo AI] 调用工具 ${functionName}`, functionArguments);

    switch (functionName) {
      case 'add_behavior':
        await addMemoLayerBehavior({
          ...commonData,
          type: functionArguments.type,
          behavior: functionArguments.behavior,
          priority: functionArguments.priority,
          status: functionArguments.status,
          deadline: functionArguments.deadline || 0,
          reminder: functionArguments.reminder || 0,
        // provide safe default for expire_at if missing from functionArguments
        expire_at: functionArguments.expire_at ?? (now + 7 * 24 * 60 * 60 * 1000)
        });
        break;
      case 'update_behavior':
        // require an id to proceed, otherwise skip
        if (!functionArguments.id) break;
        await updateMemoLayerBehavior(functionArguments.id, {
          priority: functionArguments.priority,
          status: functionArguments.status,
          deadline: functionArguments.deadline || 0,
          reminder: functionArguments.reminder || 0,
          expire_at: functionArguments.expire_at
        });
        break;
      case 'add_emotion':
        await addMemoLayerEmotion({
          ...commonData,
          emotion_type: functionArguments.emotion_type,
          intensity: functionArguments.intensity,
          trigger_topic: functionArguments.trigger_topic,
          expire_at: functionArguments.expire_at
        });
        break;
      case 'update_emotion':
        // require an id to proceed, otherwise skip
        if (!functionArguments.id) break;
        await updateMemoLayerEmotion(functionArguments.id, {
          intensity: functionArguments.intensity,
          expire_at: functionArguments.expire_at
        });
        break;
      case 'add_cognitive':
        await addMemoLayerCognitive({
          ...commonData,
          topic: functionArguments.topic,
          type: functionArguments.type,
          importance: functionArguments.importance,
          cognitive_distortion: functionArguments.cognitive_distortion || "",
          expire_at: functionArguments.expire_at
        });
        break;
      case 'update_cognitive':
        // require an id to proceed, otherwise skip
        if (!functionArguments.id) break;
        await updateMemoLayerCognitive(functionArguments.id, {
          importance: functionArguments.importance,
          expire_at: functionArguments.expire_at
        });
        break;
      case 'add_persona':
        await addMemoLayerPersona({
          ...commonData,
          trait_name: functionArguments.trait_name,
          delta: functionArguments.delta,
          baseline_trait: functionArguments.baseline_trait,
          confidence: functionArguments.confidence,
          evidence_snippet: functionArguments.evidence_snippet || "",
          expire_at: functionArguments.expire_at
        });
        break;
      case 'update_persona':
        // require an id to proceed, otherwise skip
        if (!functionArguments.id) break;
        await updateMemoLayerPersona(functionArguments.id, {
          delta: functionArguments.delta,
          baseline_trait: functionArguments.baseline_trait,
          confidence: functionArguments.confidence,
          expire_at: functionArguments.expire_at
        });
        break;
    }
  }
  logDebug('[AiMemoAnalyzer] OpenAI API 调用结束')
}
