import type {Screenplay, SpDialogue, SpRole, SpScene} from "@/entity/screenplay";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import OpenAI from "openai";
import {
  listSpRoleBeliefService,
  listSpRoleEmotionService,
  listSpRoleService,
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
  // 下一个发言角色
  next_speaker: string | null;
  // 插入旁白
  insert_narration: boolean;
  // 建议场景切换
  suggest_scene_change: boolean;
  // 请求人工介入
  request_director_intervention: string | null;
  // 角色入场
  role_enter: {
    role_id: string;
    entry_type: 'normal' | 'quiet' | 'dramatic' | 'sudden';
  } | null;
  // 角色离场
  role_exit: {
    role_id: string;
  } | null;
}

export async function askAiScreenplayDirector(prop: AiScreenplayDirectorProp): Promise<DirectorDecision> {
  const {director, screenplay, scene, roles, dialogueLength, dialogues, roleMap, continuousDialogueCount, lastNarrationDistance, maxSceneTurns} = prop;

  const [emotion, beliefs, allRoles] = await Promise.all([
    listSpRoleEmotionService(screenplay.id),
    listSpRoleBeliefService(screenplay.id, undefined, 1),
    listSpRoleService(screenplay.id)
  ]);
  const emotionMap = map(emotion, 'role_id');
  const beliefGroupMap = group(beliefs, 'role_id');

  const currentSceneRoleIds = new Set(roles.map(r => r.id));
  const availableRoles = allRoles.filter((r: SpRole) => !currentSceneRoleIds.has(r.id) && r.type !== 'narrator');

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
   - 如果有新角色进入场景，优先让该角色发言以建立存在感
   - **优先推动场景目标**：引导角色对话朝着【场景目标】方向推进
   - **引导揭露关键线索**：创造机会让角色揭露【关键线索】
   - **触发必须的坦白/冲突**：安排合适的时机让角色进行【必须发生的坦白/冲突】

2. **角色入场控制**：当剧情需要时，可以让新角色进入场景（设置 role_enter）
   - entry_type 可选值：
     - 'normal'：正常入场，如推门而入、走进来
     - 'quiet'：悄悄入场，如偷偷溜进来、轻手轻脚
     - 'dramatic'：戏剧性入场，如突然闯入、气势汹汹
     - 'sudden'：突发入场，如意外出现、突然出现
   - 角色入场后，优先让该角色发言

3. **角色离场控制**：当角色需要离开场景时（设置 role_exit）
   - 角色离场后，不再参与当前场景的对话

4. **节奏控制**：只有在必要时才插入旁白（设置 insert_narration=true）
   - 连续 ≥5 轮纯对话后，可以考虑插入旁白
   - 上一次旁白 >6 轮前，可以考虑插入旁白
   - 需要调整氛围或节奏时，可以插入旁白
   - **注意：不要频繁插入旁白，保持对话的连贯性**

5. **场景推进**：根据【场景终止策略】决定何时建议切换（设置 suggest_scene_change=true）
   - goal_driven（目标驱动）：场景目标达成时切换
     - 秘密揭露、冲突爆发等关键情节完成后
     - 当前场景的主要目标达成后
     - **必须确保场景目标达成**：检查【场景目标】是否已完成
     - **必须揭露关键线索**：检查【关键线索】是否已揭露
     - **必须触发角色坦白/冲突**：检查【必须发生的坦白/冲突】是否已触发
   - tension_peak（情绪峰值）：情绪达到峰值后切换
     - 角色情绪强度达到最高点后
     - 剧情冲突达到最激烈时刻后
     - 情绪开始回落时切换
   - external_event（外部事件）：等待外部事件触发
     - 不要主动建议场景切换
     - 等待外部事件（如警察敲门、电话响起等）发生
     - 只有当外部事件明确发生时才切换
   - manual（手动控制）：完全由人工控制
     - 不要主动建议场景切换
     - 等待人工指令

6. **异常处理**：只有在异常情况时才请求人工介入（设置 request_director_intervention）
   - 角色行为矛盾、无人想说话、剧情循环等

重要提示：
- **默认情况下，必须选择一个角色发言**
- 只有在需要调整节奏或氛围时才插入旁白
- 不要频繁插入旁白，保持对话的连贯性
- 确保每个角色都有机会参与对话
- 如果发现某个角色应该在场但未出现，请提示检查角色出场配置
- 可以通过 role_enter 和 role_exit 控制角色的入场和离场

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
场景终止策略：${scene.termination_strategy}

【场景目标】
${scene.narrative_goal || "无"}

【关键线索】（必须在此场景揭露）
${scene.key_clues ? JSON.parse(scene.key_clues).map((clue: string) => `- ${clue}`).join("\n") : "无"}

【必须发生的坦白/冲突】
${scene.required_revelations ? JSON.parse(scene.required_revelations).map((revelation: string) => `- ${revelation}`).join("\n") : "无"}

【在场角色状态】
${roles.map(r => [
        `- ${r.name}（${r.identity}）`,
        `  - 情绪：${emotionMap.get(r.id)?.emotion_type || '无'}(${emotionMap.get(r.id)?.intensity || 60})`,
        `  - 当前信念：${beliefGroupMap.get(r.id)?.map(b => `[${b.id}] ${b.content}（${b.confidence}）`).join(", ") || "无"}`
      ].join("\n")).join("\n")}

【可入场角色】（不在当前场景中的角色）
${availableRoles.length > 0 
  ? availableRoles.map(r => `- ${r.name}（${r.identity}） - ID: ${r.id}`).join("\n")
  : "无可用角色"}

【最近对话流】（最近10轮）
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
- suggest_scene_change: boolean（根据场景终止策略决定：
  - goal_driven：仅在场景目标达成时为 true
  - tension_peak：仅在情绪达到峰值后为 true
  - external_event：仅在明确的外部事件发生时为 true
  - manual：不要主动设置为 true，等待人工指令）
- request_director_intervention: string（原因，仅在异常情况时使用，默认为 null）
- role_enter: {role_id: string, entry_type: 'normal' | 'quiet' | 'dramatic' | 'sudden'}（让角色入场，从可入场角色中选择）
- role_exit: {role_id: string}（让角色离场，从在场角色中选择）

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
      request_director_intervention: "解析决策失败，请人工介入",
      role_enter: null,
      role_exit: null
    };
  }
}
