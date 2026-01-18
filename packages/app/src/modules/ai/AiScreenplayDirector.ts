import type {Screenplay, SpDialogue, SpRole, SpScene} from "@/entity/screenplay";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import OpenAI from "openai";
import {
  listSpRoleBeliefService,
  listSpRoleEmotionService,
} from "@/services/screenplay";
import {group, map} from "@/util";

interface AiScreenplayDirectorProp {
  // 决策者 AI
  director: SpRole;
  // 剧本
  screenplay: Screenplay;
  // 当前场景
  scene: SpScene;
  // 在场角色
  roles: Array<SpRole>;
  // 当前场景中已持续的轮数
  dialogueLength: number;
  // 最近 3 条对话
  dialogues: Array<SpDialogue>;
  // 角色 Map
  roleMap: Map<string, SpRole>;
  // 连续纯对话轮数
  continuousDialogueCount: number;
  // 上次 Narrator 描述距离当前轮数
  lastNarrationDistance: number;
  // 当前场景最大建议轮数
  maxSceneTurns: number;
}

export interface DirectorDecision {
  next_speaker: string | null;
  insert_narration: boolean;
  suggest_scene_change: boolean;
  request_director_intervention: string | null;
}

export async function askAiScreenplayDirector(prop: AiScreenplayDirectorProp): Promise<DirectorDecision> {
  const {director, screenplay, scene, roles, dialogueLength, dialogues, roleMap, continuousDialogueCount, lastNarrationDistance, maxSceneTurns} = prop;

  const [emotion, beliefs] = await Promise.all([
    listSpRoleEmotionService(screenplay.id),
    listSpRoleBeliefService(screenplay.id, undefined, 1),
  ]);
  const emotionMap = map(emotion, 'role_id');
  const beliefGroupMap = group(beliefs, 'role_id');

  const {model, personality} = director;
  const {aiSetting} = useSettingStore();
  const openAi = new OpenAI({
    baseURL: aiSetting.url,
    apiKey: aiSetting.key,
    dangerouslyAllowBrowser: true
  });

  const response = await openAi.chat?.completions.create({
    model: model,
    messages: [{
      role: 'system',
      content: `${personality}

你是一位小说导演，负责控制叙事节奏与角色互动。你的核心任务是推动剧情发展，让角色之间进行有意义的对话。

请基于以下原则输出 JSON 指令：

1. **发言权优先**：默认情况下，必须选择一个角色发言（设置 next_speaker 为有效的 role_id）
   - 考虑角色的情绪强度（强度高的角色更可能发言）
   - 考虑角色的未完成动机和信念
   - 考虑角色在对话中被提及的频率
   - 确保对话的连贯性和逻辑性

2. **节奏控制**：只有在必要时才插入旁白（设置 insert_narration=true）
   - 连续 ≥5 轮纯对话后，可以考虑插入旁白
   - 上一次旁白 >6 轮前，可以考虑插入旁白
   - 需要调整氛围或节奏时，可以插入旁白
   - **注意：不要频繁插入旁白，保持对话的连贯性**

3. **场景推进**：只有当场景目标达成时才建议切换（设置 suggest_scene_change=true）
   - 秘密揭露、冲突爆发等关键情节完成后
   - 当前场景的主要目标达成后

4. **异常处理**：只有在异常情况时才请求人工介入（设置 request_director_intervention）
   - 角色行为矛盾、无人想说话、剧情循环等

重要提示：
- **默认情况下，必须选择一个角色发言**
- 只有在需要调整节奏或氛围时才插入旁白
- 不要频繁插入旁白，保持对话的连贯性
- 确保每个角色都有机会参与对话

只输出 JSON，不要任何其他文本。`
    }, {
      role: 'user',
      content: `[SYSTEM]
你是一位小说导演，负责控制叙事节奏与角色互动。

请分析以下全局状态，并输出一个 JSON 指令。

【剧本信息】
标题：${screenplay.title}
背景：${screenplay.background}

【当前场景】
ID：${scene.id} | 名称：${scene.name}
描述：${scene.description}
已持续 ${dialogueLength} 轮对话

【在场角色状态】
${roles.map(r => [
        `- ${r.name}（${r.identity}）`,
        `  - 情绪：${emotionMap.get(r.id)?.emotion_type || '无'}(${emotionMap.get(r.id)?.intensity || 60})`,
        `  - 当前信念：${beliefGroupMap.get(r.id)?.map(b => `[${b.id}] ${b.content}（${b.confidence}）`).join(", ") || "无"}`
      ].join("\n")).join("\n")}

【最近对话流】
${dialogues
        .map(dialogue =>
          `[${roleMap.get(dialogue.role_id)?.name || dialogue.role_id}] ${dialogue.action ? `(${dialogue.action})` : ''}${dialogue.dialogue}`)
        .join("\n")}

【叙事统计】
- 连续纯对话轮数：${continuousDialogueCount}
- 上次 Narrator 描述：${lastNarrationDistance} 轮前
- 当前场景最大建议轮数：${maxSceneTurns}

【可用操作】
- next_speaker: role_id（**必须选择一个角色发言**，从以下角色ID中选择：${roles.map(r => r.id).join(', ')}）
- insert_narration: boolean（仅在需要调整节奏时为 true，默认为 false）
- suggest_scene_change: boolean（仅在场景目标达成时为 true，默认为 false）
- request_director_intervention: string（原因，仅在异常情况时使用，默认为 null）

请确保选择一个角色发言，推动剧情发展。`
    }],
    stream: true,
    response_format: {type: 'json_object'}
  });

  const results = new Array<string>();

  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) results.push(content);
  }

  const jsonContent = results.join("");
  try {
    return JSON.parse(jsonContent) as DirectorDecision;
  } catch (error) {
    console.error("Failed to parse director decision:", jsonContent, error);
    return {
      next_speaker: null,
      insert_narration: false,
      suggest_scene_change: false,
      request_director_intervention: "解析决策失败，请人工介入"
    };
  }
}