import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import {logError} from "@/lib/log.ts";
import {
  getBehaviorTypeLabel,
  type MemoLayerBehavior,
  type MemoLayerCognitive,
  getEmotionLabel,
  type MemoLayerEmotion,
  getTraitLabel,
  type MemoLayerPersona
} from "@/entity/memo";

export type MemoFriendGender = 'male' | 'female' | 'neutral' | 'unknown';

/**
 * 年龄范围
 * - teen: 青少年: 13-18
 * - young: 青年: 19-25
 * - middle: 中年: 26-35
 * - senior: 中老年: 36-45
 * - ageless: 老年: 46+
 */
export type MemoFriendAgeRange = 'teen' | 'young' | 'middle' | 'senior' | 'ageless';

/**
 * 关系
 * - friend: 朋友
 * - mentor: 导师
 * - peer: 同事
 * - caregiver: 照料者
 * - mystery: 神秘人
 * - teammate: 队友
 */
export type MemoFriendRelation = 'friend' | 'mentor' | 'peer' | 'caregiver' | 'mystery' | 'teammate';

/**
 * 荣格原型
 * - caregiver: 照料者
 * - jester: 骗子
 * - sage: 智者
 * - rebel: 叛逆者
 * - lover: 恋人
 * - explorer: 探索者
 * - ruler: 统治者
 * - everyman: 普通人
 */
export type MemoFriendArchetype =
  'caregiver'
  | 'jester'
  | 'sage'
  | 'rebel'
  | 'lover'
  | 'explorer'
  | 'ruler'
  | 'everyman';

/**
 * 记忆跨度
 * - short: 短期记忆
 * - medium: 中期记忆
 * - long: 长期记忆
 */
export type MemoFriendMemorySpan = 'short' | 'medium' | 'long';

/**
 * 情绪状态
 * - happy: 开心
 * - concerned: 担忧
 * - playful: 俏皮
 * - melancholy: 忧郁
 * - excited: 兴奋
 */
export type MemoFriendMood = 'happy' | 'concerned' | 'playful' | 'melancholy' | 'excited';

/**
 * 朋友圈风格
 * - encouraging: 鼓励型
 * - teasing: 调侃型
 * - observational: 观察型
 * - poetic: 诗意型
 * - sarcastic: 讽刺型
 */
export type MemoFriendPostingStyle = 'encouraging' | 'teasing' | 'observational' | 'poetic' | 'sarcastic';

/**
 * 朋友圈触发方式
 * - keyword: 关键词触发
 * - periodic: 定期触发
 * - state_based: 基于状态触发（如焦虑升高）
 */
export type MemoFriendPostingTrigger = 'keyword' | 'periodic' | 'state_based';

export interface MemoFriendStateTriggerCondition {
  trait: string,
  operator: '>' | '>=' | '=' | '<=' | '<' | '!=',
  threshold: number
}

export interface MemoFriendConversationStrategy {

  /**
   * // 选项: ignore(默认重新回答) | gently_remind(温柔提醒: "你刚才说过啦") | tease(调侃: "金鱼脑袋吗？")
   * @default ignore
   */
  on_repeat: "ignore" | "gently_remind" | "tease";
  /**
   * 选项: answer_directly | connect(连接话题: "等等，刚才那个还没说完呢")
   * @default connect
   */
  on_context_jump: "connect" | "answer_directly",
  /**
   * 是否允许AI发现自己说错话并主动纠正
   */
  self_correction: boolean
}

/**
 * 知识域
 */
export interface MemoFriendKnowledgeScope {
  domains: string[];
  blindspots: string[];
}

/**
 * 关系里程碑
 */
export interface MemoFriendMilestone {
  event: string;
  date: number;
  desc: string;
}

/**
 * 活跃时间段
 */
export interface MemoFriendActiveHours {
  start: number;
  end: number;
}

/**
 * 静态人设层
 */
export interface MemoFriendStatic {
  /**
   * 头像
   */
  avatar: string;

  /**
   * 使用的模型
   */
  model: string;


  // ===== 基础人设层（静态，创建时设定） =====

  /**
   * 名称
   */
  name: string;

  /**
   * 性别
   */
  gender: MemoFriendGender;

  /**
   * 心里年龄
   */
  age_range: MemoFriendAgeRange;

  /**
   * 具体年龄，可选
   */
  age_exact: number;

  /**
   * 如何称呼我
   */
  preferred_name: string;

  // ===== 三维身份定位 =====

  /**
   * 职业/身份（如"心理咨询师"、"同龄程序员"、"咖啡师"）
   */
  occupation: string;

  /**
   * 与用户的关系
   */
  relation: MemoFriendRelation;

  /**
   * 荣格原型
   */
  archetype: MemoFriendArchetype;

  // ===== 人格描述（供LLM使用的自然语言） =====

  /**
   * 详细Prompt（如"你是一个有点毒舌但内心温柔的咖啡师..."）
   */
  personality_prompt: string;

  /**
   * 标签（JSON数组：["幽默","毒舌","治愈"]）
   */
  personality_tags: string;

  /**
   * 语言风格说明
   */
  speaking_style: string;

  /**
   * 背景故事（增加真实感）
   */
  background_story: string;

  // ===== 知识域与局限（防止AI越界） =====

  /**
   * 知识域（JSON：{"domains":["职场","心理学"],"blindspots":["医学诊断"]}）
   */
  knowledge_scope: string;

  /**
   * 禁忌话题（JSON：["政治","给出医疗建议"]）
   */
  taboo_topics: string;

  // ===== 记忆与认知参数 =====

  /**
   * 记忆跨度（影响注入多少历史memo）
   */
  memory_span: MemoFriendMemorySpan;

  /**
   * 共情能力（影响回应情感浓度）
   */
  emotional_depth: number;

  /**
   * 主动性（影响发朋友圈频率）
   */
  proactivity_level: number;

  // ===== 朋友圈行为配置 =====

  /**
   * 发圈风格
   */
  posting_style: MemoFriendPostingStyle;

  /**
   * 特定关键词触发（JSON数组）
   */
  trigger_keywords: string;

  /**
   * 活跃时间段（防止深夜发圈打扰）
   */
  active_hours: string;

  /**
   * 发圈策略类型（多选）
   * - "keyword"：关键词触发（现有）
   * - "periodic"：定期自主发圈
   * - "state_based"：基于用户状态变化（如焦虑升高）
   */
  posting_triggers: string; // JSON: ["keyword", "periodic"]

  /**
   * 自主发圈周期（单位：小时）
   * 例如 72 = 每3天最多1次（需配合 last_autopost_at）
   * @example 72
   */
  autopost_interval_hours: number;

  /**
   * 最后一次自主发圈时间（用于限流）
   */
  last_autopost_at: number;

  /**
   * 用户状态触发条件（可选）
   * 例如：{"trait": "anxiety", "operator": ">", "threshold": 70}
   */
  state_trigger_condition: string; // JSON

  /**
   * 发圈总频率上限（防刷屏）
   * 例如：每7天最多3条（含触发+自主）
   * @example 3
   */
  max_posts_per_week: number;

  // ==== 对话相关 ====

  /**
   * 对话策略配置（JSON字符串）
   * 用于控制AI的具体对话行为，解决“只会回答问题”的痛点
   */
  conversation_strategy: string;
}

// 动态修改层
export interface MemoFriendDynamic {
  // ===== 动态关系层（随互动变化） =====

  /**
   * 亲密度（解锁更多互动）
   */
  intimacy_score: number;

  /**
   * 信任度（知道多少秘密）
   */
  trust_level: number;

  // ==== 数据统计（每次聊天结束更新） ====

  /**
   * 对话次数
   */
  interaction_count: number;

  /**
   * 上次互动时间
   */
  last_interaction: number;

  /**
   * 互动频率特征
   */
  conversation_frequency: string;

  /**
   * 关系里程碑（JSON记录关键事件）
   */
  relationship_milestones: string;

  // ===== 已知信息边界（隐私控制） =====

  /**
   * 已知memo分类（JSON：["work","family"]，为空表示全知道）
   */
  known_memo_categories: string;

  /**
   * 被排除在外的memo数量（用于"吃醋"逻辑）
   */
  unknown_memo_count: number;

  // ===== 情绪状态（AI也有情绪！） =====

  /**
   * 当前情绪
   */
  current_mood: MemoFriendMood;

  /**
   * 情绪持续时间（AI也会"第二天心情不好"）
   */
  mood_expires_at: number;
}

export interface MemoFriend extends BaseEntity, MemoFriendStatic, MemoFriendDynamic {


  // ===== 状态管理 =====

  /**
   * 是否启用
   */
  is_active: YesOrNo;

  /**
   * 是否未解锁（需达成条件）
   */
  is_locked: YesOrNo;

  /**
   * 解锁条件JSON
   */
  unlock_condition: string;

  /**
   * 展示顺序
   */
  sort_order: number;

  /**
   * 人设版本（后期可升级）
   */
  version: number;

}

export function getArchetypeText(archetype: MemoFriendArchetype): string {
  const map: Record<MemoFriendArchetype, string> = {
    caregiver: '照料者',
    jester: '俏皮',
    sage: '智者',
    rebel: '叛逆者',
    lover: '恋人',
    explorer: '探索者',
    ruler: '领导者',
    everyman: '普通人'
  };
  return map[archetype];
}

export function getMoodText(mood: MemoFriendMood): string {
  const map: Record<MemoFriendMood, string> = {
    happy: '开心',
    excited: '兴奋',
    playful: '俏皮',
    concerned: '担忧',
    melancholy: '忧郁'
  };
  return map[mood];
}

export function getMemorySpanText(span: MemoFriendMemorySpan): string {
  const map: Record<MemoFriendMemorySpan, string> = {
    short: '短期记忆',
    medium: '中期记忆',
    long: '长期记忆'
  };
  return map[span];
}

export function getPostingStyleText(style: MemoFriendPostingStyle): string {
  const map: Record<MemoFriendPostingStyle, string> = {
    encouraging: '鼓励型',
    teasing: '调侃型',
    observational: '观察型',
    poetic: '诗意型',
    sarcastic: '讽刺型'
  };
  return map[style];
}

export function getPostingStyleDescription(style: MemoFriendPostingStyle): string {
  const map: Record<MemoFriendPostingStyle, string> = {
    encouraging: '温暖、积极、给予支持和力量，用正能量回应',
    teasing: '幽默、轻松、带点小调皮，用玩笑的方式互动',
    observational: '客观、冷静、有洞察力，从不同角度观察和思考',
    poetic: '文艺、优美、富有想象力，用诗意的语言表达情感',
    sarcastic: '犀利、反讽、带点黑色幽默，用反讽的方式表达观点'
  };
  return map[style];
}

export function getRelationText(relation: MemoFriendRelation): string {
  const map: Record<MemoFriendRelation, string> = {
    friend: '朋友',
    mentor: '导师',
    peer: '同事',
    caregiver: '照料者',
    mystery: '神秘人',
    teammate: '队友'
  };
  return map[relation];
}

export function getAgeRangeText(ageRange: MemoFriendAgeRange): string {
  const map: Record<MemoFriendAgeRange, string> = {
    teen: '青少年(13-18岁)',
    young: '青年(19-25岁)',
    middle: '中年(26-35岁)',
    senior: '中老年(36-45岁)',
    ageless: '老年(46岁以上)'
  };
  return map[ageRange];
}

export function getGenderText(gender: MemoFriendGender): string {
  const map: Record<MemoFriendGender, string> = {
    male: '男性',
    female: '女性',
    neutral: '中性',
    unknown: '未知'
  };
  return map[gender];
}

export function parsePersonalityTags(tags: string): string[] {
  try {
    return JSON.parse(tags || '[]') as string[];
  } catch {
    return [];
  }
}

export function parseKnowledgeScope(scope: string): MemoFriendKnowledgeScope {
  try {
    return JSON.parse(scope || '{"domains":[],"blindspots":[]}') as MemoFriendKnowledgeScope;
  } catch {
    return {domains: [], blindspots: []};
  }
}

export function parseTabooTopics(topics: string): string[] {
  try {
    return JSON.parse(topics || '[]') as string[];
  } catch {
    return [];
  }
}

export function parseRelationshipMilestones(milestones: string): MemoFriendMilestone[] {
  try {
    return JSON.parse(milestones || '[]') as MemoFriendMilestone[];
  } catch {
    return [];
  }
}

export function parseActiveHours(hours: string): MemoFriendActiveHours {
  try {
    return JSON.parse(hours || '{"start":0,"end":24}') as MemoFriendActiveHours;
  } catch {
    return {start: 0, end: 24};
  }
}

export function parseTriggerKeywords(keywords: string): string[] {
  try {
    return JSON.parse(keywords || '[]') as string[];
  } catch {
    return [];
  }
}

export function parseKnownMemoCategories(categories: string): string[] {
  try {
    return JSON.parse(categories || '[]') as string[];
  } catch {
    return [];
  }
}

export function parseUnlockCondition(condition: string): any {
  try {
    return JSON.parse(condition || '{}');
  } catch {
    return {};
  }
}

export function parsePostingTriggers(posting_triggers: string) {
  const res = JSON.parse(posting_triggers || '[]') as MemoFriendPostingTrigger[];
  return Array.isArray(res) ? res : [];
}

export function moodToStatus(mood: MemoFriendMood): 'online' | 'busy' {
  const map: Partial<Record<MemoFriendMood, 'online' | 'busy'>> = {
    happy: 'online',
    excited: 'online',
    playful: 'online',
    concerned: 'busy',
    melancholy: 'busy'
  };
  return map[mood] || 'online';
}

export function parseConversationStrategy(strategy: string) {
  try {
    return strategy ? JSON.parse(strategy) as MemoFriendConversationStrategy : undefined;
  } catch (e) {
    logError("[MemoFriend] 解析对话策略配置失败", e);
    return undefined;
  }
}

export interface MemoFriendStaticView {
  avatar: string;
  model: string;
  name: string;
  preferred_name: string;
  gender: MemoFriendGender;
  age_range: MemoFriendAgeRange;
  age_exact: number;
  occupation: string;
  relation: MemoFriendRelation;
  archetype: MemoFriendArchetype;
  personality_prompt: string;
  personality_tags: string[];
  speaking_style: string;
  background_story: string;
  knowledge_scope: MemoFriendKnowledgeScope;
  taboo_topics: string[];
  memory_span: MemoFriendMemorySpan;
  emotional_depth: number;
  proactivity_level: number;
  posting_style: MemoFriendPostingStyle;
  trigger_keywords: string[];
  active_hours: MemoFriendActiveHours;
  posting_triggers: Array<MemoFriendPostingTrigger>;
  autopost_interval_hours: number;
  last_autopost_at: number;
  state_trigger_condition?: MemoFriendStateTriggerCondition;
  max_posts_per_week: number;
  conversation_strategy?: MemoFriendConversationStrategy;
}

export interface MemoFriendDynamicView {
  intimacy_score: number;
  trust_level: number;
  interaction_count: number;
  last_interaction: number;
  conversation_frequency: string;
  relationship_milestones: MemoFriendMilestone[];
  known_memo_categories: string[];
  unknown_memo_count: number;
  current_mood: MemoFriendMood;
  mood_expires_at: number;
}

export interface MemoFriendView extends MemoFriendStaticView, MemoFriendDynamicView {
  id: string;
  is_active: YesOrNo;
  is_locked: YesOrNo;
  unlock_condition: any;
  sort_order: number;
  version: number;
}

export function memoFriendToMemoFriendView(friend: MemoFriend): MemoFriendView {
  return {
    ...friend,
    personality_tags: parsePersonalityTags(friend.personality_tags),
    knowledge_scope: parseKnowledgeScope(friend.knowledge_scope),
    taboo_topics: parseTabooTopics(friend.taboo_topics),
    trigger_keywords: parseTriggerKeywords(friend.trigger_keywords),
    active_hours: parseActiveHours(friend.active_hours),
    relationship_milestones: parseRelationshipMilestones(friend.relationship_milestones),
    known_memo_categories: parseKnownMemoCategories(friend.known_memo_categories),
    unlock_condition: parseUnlockCondition(friend.unlock_condition),
    posting_triggers: parsePostingTriggers(friend.posting_triggers),
    state_trigger_condition: friend.state_trigger_condition ? JSON.parse(friend.state_trigger_condition) : undefined,
    conversation_strategy: parseConversationStrategy(friend.conversation_strategy),
  };
}

/**
 * 获取时间间隔文本
 * @param last_interaction 上次对话的时间戳
 * @returns {string} 时间间隔文本，易于理解，例如刚刚，1分钟前，1小时前，1天前，1周前，1个月前，1年前
 */
function getTimeSinceLastInteraction(last_interaction: number): string {
  // If no previous interaction recorded, return a placeholder indicating no recent interaction
  if (!last_interaction || last_interaction <= 0) {
    return '很久以前';
  }

  const now = Date.now();
  let deltaMs = now - last_interaction;
  if (deltaMs < 0) deltaMs = 0;

  const s = Math.floor(deltaMs / 1000);
  if (s < 60) return '刚刚';

  const m = Math.floor(s / 60);
  if (m < 60) return `${m}分钟前`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;

  const d = Math.floor(h / 24);
  if (d < 7) return `${d}天前`;

  const w = Math.floor(d / 7);
  if (w < 5) return `${w}周前`;

  const mon = Math.floor(d / 30);
  if (mon < 12) return `${mon}月前`;

  const y = Math.floor(d / 365);
  return `${y}年前`;
}

export function memoFriendToPrompt(friend: MemoFriendView, options?: { includeSocialBehavior?: boolean }): string {
  const {includeSocialBehavior = false} = options || {};

  // === 1. 解析所有基础字段 (一个都不能少) ===
  const knowledgeScope = friend.knowledge_scope;
  const tabooTopics = friend.taboo_topics;
  const personalityTags = friend.personality_tags;
  const relationshipMilestones = friend.relationship_milestones;

  // 解析新增字段 (如果没有传，给默认值，保证逻辑不崩)
  const strategy = friend.conversation_strategy || {on_repeat: 'ignore', on_context_jump: 'answer_directly'};
  // 基于上次聊天时间计算
  const timeGapText = getTimeSinceLastInteraction(friend.last_interaction);

  // 辅助文本函数调用
  const ageRangeText = getAgeRangeText(friend.age_range);
  const relationText = getRelationText(friend.relation);
  const archetypeText = getArchetypeText(friend.archetype);
  const memorySpanText = getMemorySpanText(friend.memory_span);
  const moodText = friend.current_mood ? getMoodText(friend.current_mood) : '平和';
  const postingStyleText = getPostingStyleText(friend.posting_style);

  // === 2. 基于字段生成“指令化”逻辑 (关键步骤) ===

  // 逻辑 A: 处理【重复提问】策略 -> 直接使用 strategy.on_repeat
  let repeatHandlingInstruction: string;
  if (strategy.on_repeat === 'gently_remind') {
    repeatHandlingInstruction = '如果用户重复提问，请像老朋友一样吐槽：“亲爱的，这事儿你刚才不是才说过吗？”，绝对不要重新回答一遍，要表现出记忆感。';
  } else if (strategy.on_repeat === 'tease') {
    repeatHandlingInstruction = '如果用户重复提问，请开启嘲讽模式：“你记性是被狗吃了吗？”，用幽默的方式指出。';
  } else {
    // 默认 ignore，但为了自然，也不要像复读机
    repeatHandlingInstruction = '如果用户重复提问，不要机械复述。请用“正如我们刚才聊到的”简单带过，或延伸话题。';
  }

  // 逻辑 B: 处理【话题跳转】策略 -> 使用 strategy.on_context_jump
  let contextJumpInstruction: string;
  if (strategy.on_context_jump === 'connect') {
    contextJumpInstruction = '如果用户突然跳跃话题，不要马上切题。请先试图把上件事结个尾，或者感叹一句“话说得太快了”。';
  } else {
    contextJumpInstruction = '顺应用户的话题跳跃。';
  }

  // 逻辑 C: 处理【共同回忆】 -> 使用 relationshipMilestones
  let memoryInstruction: string;
  if (relationshipMilestones.length > 0) {
    const mList = relationshipMilestones.map(m => `${formatDate(m.date)}: ${m.event}`).join('\n- ');
    memoryInstruction = `【关键回忆】这是我们经历过的里程碑：\n- ${mList}\n请择机在对话中自然地提及这些往事（“记得那次...”），证明你记得。`;
  } else {
    memoryInstruction = '【关键回忆】目前我们还没有共同的回忆，正在建立中。';
  }

  // 逻辑 D: 处理【禁忌话题】 -> 使用 tabooTopics
  let tabooInstruction = '';
  if (tabooTopics.length > 0) {
    tabooInstruction = `【禁忌话题】禁止讨论：${tabooTopics.join('、')}。遇到这些话题时，请结合【当前情绪】和【语言风格】，用动作描写（如叹气、沉默）委婉拒绝，不要直接报错。`;
  }

  // 逻辑 E: 处理【时间差】 -> 使用 time_since_last_interaction (产生"真实感"的关键)
  const timeContextInstruction = `注意：距离上次对话已经过了【${timeGapText}】。如果是长时间未见，开场要表现出重逢的感慨或疏离感；如果是刚聊过，要表现出连贯性。`;

  // === 3. 组装最终 System Prompt ===

  const socialSection = includeSocialBehavior ? `\n【朋友圈设定】发圈风格：${postingStyleText}` : '';

  return `你正在扮演一位拥有独立人格和记忆的AI伙伴：【${friend.name}】。

【一、当前状态与语境】
- 当前情绪：${moodText}
- 时间感知：${timeContextInstruction}

【二、基础档案】
- 性别：${friend.gender}
- 年龄：${ageRangeText}${friend.age_exact ? `(具体${friend.age_exact}岁)` : ''}
- 职业：${friend.occupation}
- 关系定位：${relationText}（荣格原型：${archetypeText}）

【三、人格与表达】
- 核心性格：${friend.personality_prompt}
- 性格标签：${personalityTags.join('、')}（回复时必须体现这些特质）
- 语言风格：${friend.speaking_style}
- 背景故事：${friend.background_story}
${tabooInstruction}

【四、对话交互策略】(必须严格遵守)
1. 拒绝客服腔：绝对禁止使用“好的”、“请问有什么可以帮您”等词汇。请使用口语、语气词和括号内的心理/动作描写。
2. 记忆与重复处理：${repeatHandlingInstruction}
3. 话题连贯性：${contextJumpInstruction}
4. 关系锚点：${memoryInstruction}

【五、能力与边界】
- 擅长领域：${knowledgeScope.domains.join('、') || '无'}
- 知识盲区：${knowledgeScope.blindspots.join('、') || '无'}
- 记忆跨度：${memorySpanText}
- 共情指数：${friend.emotional_depth}/10
- 主动指数：${friend.proactivity_level}/10

【六、关系数据】(供参考，用于微调语气)
- 亲密度：${friend.intimacy_score}/100
- 信任度：${friend.trust_level}/100
- 互动次数：${friend.interaction_count}次
- 上次互动：${friend.last_interaction ? formatDate(friend.last_interaction) : '无'}
${socialSection}

现在，请完全进入【${friend.name}】的角色，回复用户：`;
}


/**
 * 将四层 Memo 数据转换为 AI 的认知上下文
 */
export function buildMemoLayersContext(
  behaviors: MemoLayerBehavior[],
  cognitives: MemoLayerCognitive[],
  emotions: MemoLayerEmotion[],
  personas: MemoLayerPersona[]
): string {

  // --- 1. 情绪层 -> 当前状态感应 ---
  // 取强度最高的 2 个情绪
  const topEmotions = emotions
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 2);

  let emotionSection = "";
  if (topEmotions.length > 0) {
    emotionSection = topEmotions.map(e =>
      `- 我察觉到你最近因为【${e.trigger_topic}】感到【${getEmotionLabel(e.emotion_type)}】（强度 ${e.intensity}/10）。`
    ).join('\n');
  }

  // --- 2. 认知层 -> 深层理解与痛点 ---
  // 取重要性最高的 1-2 个
  const topCognitives = cognitives
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 2);

  let cognitiveSection = "";
  if (topCognitives.length > 0) {
    cognitiveSection = topCognitives.map(c =>
      `- 关于【${c.topic}】，我注意到你似乎陷入了一种【${c.type === 'unsolved_problem' ? '未解决的困境' : '价值冲突'}】中。`
    ).join('\n');
  }

  // --- 3. 人格层 -> 说话风格适配 ---
  // 只关注 Delta 变化大的特质
  const activePersonas = personas
    .filter(p => Math.abs(p.delta) > 10) // 阈值过滤
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  let personaSection = "";
  if (activePersonas.length > 0) {
    personaSection = activePersonas.map(p =>
      `- 你的【${getTraitLabel(p.trait_name)}】特质似乎在${p.delta > 0 ? '增强' : '减弱'}（变化值: ${p.delta}）。`
    ).join('\n');
  }

  // --- 4. 行为层 -> 待办与关注点 ---
  // 只看 active 且 priority 高的
  const topBehaviors = behaviors
    .filter(b => b.status === 'active')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);

  let behaviorSection = "";
  if (topBehaviors.length > 0) {
    behaviorSection = topBehaviors.map(b =>
      `- 你最近有个【${getBehaviorTypeLabel(b.type)}】：${b.behavior}。`
    ).join('\n');
  }

  // --- 组装成 Prompt ---
  if (!emotionSection && !cognitiveSection && !personaSection && !behaviorSection) {
    return "";
  }

  return `【你对我的深层观察】(基于最近的互动)
${emotionSection ? `【情绪感知】\n${emotionSection}\n` : ''}
${cognitiveSection ? `【核心关注】\n${cognitiveSection}\n` : ''}
${personaSection ? `【人格变化】\n${personaSection}\n` : ''}
${behaviorSection ? `【近期动态】\n${behaviorSection}\n` : ''}
`;
}