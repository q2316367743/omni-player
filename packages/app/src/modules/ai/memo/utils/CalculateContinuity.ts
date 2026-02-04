import type {MemoChat, MemoFriendView} from "@/entity/memo";

interface ContextContinuityScore {
  timeGap: number;           // 时间间隔（分钟）
  timeOfDayChange: boolean;  // 是否跨时段（如昨晚→今早）
  topicShift: number;        // 话题相似度 0-1（用嵌入向量算）
  userIntent: 'continue' | 'new_topic' | 'ambiguous';  // 用户明示意图
  aiMoodExpired: boolean;    // AI 情绪是否过期

  // 综合得分
  shouldPreserveContext: boolean;  // true=暂停 false=断裂
  confidence: number;              // 置信度，低置信度时主动询问
}

/**
 * 话题因子
 * @param content 消息内容
 * @param input 输入内容
 */
function calculateSimilarity(content: string, input: string) {
  return 0.5;
}

function detectIntent(input: string): 'continue' | 'new_topic' | 'ambiguous' {
  // 1. 询问用户明示意图
  // 2. 尝试解析用户意图
  // 3. 模糊意图时，询问用户是否继续
  return 'continue';
}

/**
 * 计算上下文连续性
 * @param lastMessage 上一个消息
 * @param newInput 新输入
 * @param friend 当前好友
 */
export function calculateContinuity(
  lastMessage: MemoChat,
  newInput: string,
  friend: MemoFriendView
): ContextContinuityScore {
  const now = Date.now();
  const gap = (now - lastMessage.created_at) / (1000 * 60); // 分钟

  // 1. 时间因子（非线性）
  let timeScore: number;
  if (gap < 30) timeScore = 1.0;           // 30分钟内：肯定连续
  else if (gap < 120) timeScore = 0.8;     // 2小时：大概率连续
  else if (gap < 480) timeScore = 0.5;     // 8小时：模糊地带（睡觉）
  else if (gap < 1440) timeScore = 0.3;    // 24小时：大概率断裂
  else timeScore = 0.1;                    // 隔天：基本新会话

  // 2. 时段因子（关键！）
  const lastHour = new Date(lastMessage.created_at).getHours();
  const nowHour = new Date(now).getHours();
  const crossedSleep = (lastHour > 22 && nowHour < 10) ||  // 昨晚→今早
    (lastHour < 6 && nowHour > 8);       // 凌晨→早上
  // 跨睡眠时段大幅降低连续性预期
  if (crossedSleep) timeScore *= 0.5;

  // 3. 话题因子（需要嵌入模型）
  const topicSim = calculateSimilarity(lastMessage.content, newInput);

  // 4. 用户明示意图（最高优先级）
  const intent = detectIntent(newInput);  // "接着刚才的说" vs "我问你个事"

  // 5. AI 情绪过期（超过 mood_expires_at）
  const moodExpired = friend.mood_expires_at < now;

  // 综合判断
  let preserve: boolean;
  let confidence: number;

  if (intent === 'continue') {
    preserve = true;
    confidence = 0.95;
  } else if (intent === 'new_topic') {
    preserve = false;
    confidence = 0.95;
  } else {
    // 模糊意图，综合计算
    const score = timeScore * 0.4 + topicSim * 0.4 + (moodExpired ? 0 : 0.2);
    preserve = score > 0.5;
    confidence = Math.abs(score - 0.5) * 2;  // 越接近0.5越不确定
  }

  return {
    timeGap: gap,
    timeOfDayChange: crossedSleep,
    topicShift: topicSim,
    userIntent: intent,
    aiMoodExpired: moodExpired,
    shouldPreserveContext: preserve,
    confidence
  };
}