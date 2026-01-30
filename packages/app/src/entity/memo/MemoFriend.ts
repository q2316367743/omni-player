import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

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
    return { domains: [], blindspots: [] };
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
    return { start: 0, end: 24 };
  }
}

export function parseTriggerKeywords(keywords: string): string[] {
  try {
    return JSON.parse(keywords || '[]') as string[];
  } catch {
    return [];
  }
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

/**
 * 将 MemoFriend 对象转换为 LLM 提示词
 * @param friend MemoFriend 对象
 * @param options 可选参数
 * @param options.includeSocialBehavior 是否包含朋友圈行为，默认为 true
 * @returns 格式化的提示词字符串
 */
export function memoFriendToPrompt(friend: MemoFriend, options?: { includeSocialBehavior?: boolean }): string {
  const {includeSocialBehavior = true} = options || {};
  const knowledgeScope = parseKnowledgeScope(friend.knowledge_scope);
  const tabooTopics = parseTabooTopics(friend.taboo_topics);
  const personalityTags = parsePersonalityTags(friend.personality_tags);
  const relationshipMilestones = parseRelationshipMilestones(friend.relationship_milestones);
  const activeHours = parseActiveHours(friend.active_hours);
  const triggerKeywords = parseTriggerKeywords(friend.trigger_keywords);

  const ageRangeText = getAgeRangeText(friend.age_range);
  const relationText = getRelationText(friend.relation);
  const archetypeText = getArchetypeText(friend.archetype);
  const memorySpanText = getMemorySpanText(friend.memory_span);
  const moodText = friend.current_mood ? getMoodText(friend.current_mood) : '无';
  const postingStyleText = getPostingStyleText(friend.posting_style);

  const socialBehaviorSection = includeSocialBehavior ? `
【朋友圈行为】
发圈风格：${postingStyleText}
触发关键词：${triggerKeywords.join('、') || '无'}
活跃时间段：${activeHours.start}:00 - ${activeHours.end}:00` : '';

  return `【角色设定】
姓名：${friend.name}
性别：${friend.gender}
年龄：${ageRangeText}${friend.age_exact ? `（具体年龄：${friend.age_exact}岁）` : ''}
职业/身份：${friend.occupation}
与用户的关系：${relationText}
荣格原型：${archetypeText}

【人格描述】
人设：${friend.personality_prompt}
性格标签：${personalityTags.join('、')}
语言风格：${friend.speaking_style}
背景故事：${friend.background_story}

【知识域与局限】
擅长领域：${knowledgeScope.domains.join('、') || '无'}
知识盲区：${knowledgeScope.blindspots.join('、') || '无'}
禁忌话题：${tabooTopics.join('、') || '无'}

【认知参数】
记忆跨度：${memorySpanText}
共情能力：${friend.emotional_depth}/10
主动性：${friend.proactivity_level}/10

【关系状态】
亲密度：${friend.intimacy_score}/100
信任度：${friend.trust_level}/100
对话次数：${friend.interaction_count}
上次互动：${friend.last_interaction ? new Date(friend.last_interaction).toLocaleString('zh-CN') : '无'}
互动频率：${friend.conversation_frequency || '未知'}
关系里程碑：${relationshipMilestones.length > 0 ? relationshipMilestones.map(m => `${m.event}（${new Date(m.date).toLocaleDateString('zh-CN')}）`).join('、') : '无'}

【当前情绪】
情绪状态：${moodText}
情绪持续时间：${friend.mood_expires_at ? `至 ${new Date(friend.mood_expires_at).toLocaleString('zh-CN')}` : '无限制'}${socialBehaviorSection}`;
}