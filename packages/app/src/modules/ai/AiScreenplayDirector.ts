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

请基于以下原则输出 JSON 指令：

1. **发言权**：选择最可能/最需要说话的角色（考虑情绪强度、未完成动机、被提及频率）
2. **节奏**：若连续 ≥3 轮纯对话，或上一次旁白 >4 轮前，设 insert_narration=true
3. **场景推进**：若当前场景已达成目标（如秘密揭露、冲突爆发），建议切换
4. **异常处理**：若角色行为矛盾、无人想说话、剧情循环，请求人工介入

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
- next_speaker: role_id（可为空表示暂停）
- insert_narration: boolean
- suggest_scene_change: boolean
- request_director_intervention: string（原因）`
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