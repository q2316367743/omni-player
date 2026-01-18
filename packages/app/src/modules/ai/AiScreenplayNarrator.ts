import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import OpenAI from "openai";
import type {Screenplay, SpDialogue, SpRole, SpScene} from "@/entity/screenplay";
import {addSpDialogueService} from "@/services/screenplay";

interface AiScreenplayNarratorProp {
  // 叙述者 AI
  narrator: SpRole;
  // 剧本
  screenplay: Screenplay;
  // 当前场景
  scene: SpScene;
  // 在场角色
  roles: Array<SpRole>;
  // 最近 3 条对话
  dialogues: Array<SpDialogue>;
  // 角色 Map
  roleMap: Map<string, SpRole>;
  /**
   * 任务
   * - task = "describe_action"（角色动作润色）
   * - task = "describe_scene"（场景切换）
   * - task = "insert_atmosphere"（对话间歇）
   * - task = "heighten_tension"（冲突强化）
   */
  task: "describe_action" | 'describe_scene' | 'insert_atmosphere' | 'heighten_tension';
  // 触发原因
  triggerReason: string;
}

const taskMap = {
  'describe_action': `请将以下角色的动作转化为文学化描写：
- 聚焦该角色的肢体、微表情、与物品的互动
- 暗示其情绪，但不说破
- 50～80字，一句或两句`,
  'describe_scene': `请描写新场景的环境氛围：
- 包含地点、时间、天气、光影、声音
- 建立整体情绪基调（压抑/紧张/诡异等）
- 80～120字`,
  'insert_atmosphere': `当前已有多轮对话，请插入一段氛围描写：
- 描写全场沉默、空气凝固感、多人微反应
- 可提及环境如何呼应情绪（如钟表滴答、风声）
- 60～100字`,
  'heighten_tension': `刚刚发生激烈对话，请强化戏剧张力：
- 描写对峙双方的肢体语言对比
- 加入象征性细节（如打翻的水杯、闪烁的灯）
- 70～100字`,
}


/**
 * ## 🎙️ 一、Narrator AI 的核心职责
 *
 * | 职责 | 说明 | 示例 |
 * |------|------|------|
 * | **环境描写** | 补充场景氛围、时间、天气、光影 | *暴雨砸在玻璃上，像无数只手在拍打* |
 * | **动作润色** | 将干巴巴的 `action` 转为文学化描写 | 输入：“攥紧拳头” → 输出：“指节发白，仿佛要把什么捏碎” |
 * | **心理暗示** | 暗示角色情绪（不直接说“他害怕”） | *他的目光不断瞟向门口，喉结上下滚动* |
 * | **节奏控制** | 在对话间隙插入停顿、张力或过渡 | *空气凝固了。连钟表的滴答声都显得刺耳* |
 * | **伏笔埋设** | 强调关键细节（为潜在线索服务） | *那枚怀表静静躺在桌上，表面裂了一道细纹* |
 *
 * > ✅ **不干的事**：
 * > - 不参与角色对话
 * > - 不揭示秘密（除非剧情已公开）
 * > - 不解释动机（留给角色自己说）
 *
 * ---
 *
 * ## 🔁 五、何时触发 Narrator AI？
 *
 * ### 自动触发条件（由导演逻辑判断）：
 *
 * | 触发时机 | 说明 |
 * |--------|------|
 * | **场景切换后** | 生成环境描写 |
 * | **角色执行关键动作** | 如“拿出道具”“突然站起” |
 * | **连续2轮无 Narrator 描述** | 防止纯对话流水账 |
 * | **情绪强度 > 80** | 自动润色该角色状态 |
 * | **导演手动请求** | “增加一段氛围描写” |
 *
 * ### 工作流示例：
 * 1. 用户点击“开始演绎”
 * 2. 系统检测到新场景 → 调用 Narrator AI 生成开场描写
 * 3. 角色 A 发言：`{"action": "手伸向口袋", ...}`
 * 4. 系统判断此为关键动作 → 调用 Narrator AI 润色
 * 5. 插入两条记录到 `ScreenplayDialogue`：
 *    - `[narrator] 他的手指颤抖着...`
 *    - `[role A] （掏出U盘）“这就是证据。”`
 *
 * ---
 *
 * ## ✨ 六、高级功能（可选）
 *
 * | 功能 | 实现方式 |
 * |------|--------|
 * | **风格切换** | 在 `Screenplay` 表加 `narrative_style` 字段（如“冷硬派”“哥特风”） |
 * | **焦点控制** | 导演可指定“聚焦李维”，Narrator 优先描写他 |
 * | **伏笔高亮** | 若 `LatentClue` 中某线索未被注意，Narrator 可强化描写相关物品 |
 *
 * ```
 * [角色 AI] ──┐
 * [决策引擎] ──┤
 * [场景管理] ──┼──→ 调用 → [Narrator AI] → 插入 ScreenplayDialogue
 * [冲突检测] ──┤
 * [你（导演）] ──┘
 * ```
 */
export async function askAiScreenplayNarrator(prop: AiScreenplayNarratorProp) {
  const {narrator, screenplay, scene, roles, dialogues, roleMap, triggerReason, task} = prop;
  const {model, personality} = narrator;
  const {aiSetting} = useSettingStore();
  const openAi = new OpenAI({
    baseURL: aiSetting.url,
    apiKey: aiSetting.key,
    dangerouslyAllowBrowser: true
  });

  const response = await openAi.chat?.completions.create({
    model: model,
    messages: [{
      role: "system",
      content: personality
    }, {
      role: 'user',
      content: `[SYSTEM]
${taskMap[task]}

【剧本背景】
${screenplay.background}

【当前场景】
地点：${scene.name}
描述：${scene.description}

【在场角色】
${roles.map(r => `- ${r.name}（${r.identity}）`).join("\n")}

【最近对话】（最近3轮）
${dialogues
        .map(dialogue => 
          `[${roleMap.get(dialogue.role_id)?.name || dialogue.role_id}] ${dialogue.action ? `(${dialogue.action})` : ''}${dialogue.dialogue}`)
        .join("\n")}

【当前叙事需求】
${triggerReason}`
    }],
    // tool_choice: [],
    stream: true,
    // temperature: assistant.temperature,
    // top_p: assistant.topP,
    // top_logprobs: assistant.maxChats,
  });
  const results = new Array<string>();

  // 流式处理结果
  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) results.push(content);
  }
  await addSpDialogueService({
    screenplay_id: screenplay.id,
    scene_id: scene.id,
    type: 'narrator',
    role_id: '',
    action: '',
    dialogue: results.join(""),
  })
}