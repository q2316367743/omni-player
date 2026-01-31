import type {MemoMessage} from "@/entity/memo";
import {logDebug} from "@/lib/log.ts";

interface FilterOptions {
  /** 追问场景下的窗口大小（保留更多上下文） */
  followUpWindow?: number;
  /** 新话题场景下的窗口大小（激进压缩） */
  newTopicWindow?: number;
  /** 默认窗口大小 */
  defaultWindow?: number;
  /** 历史AI回复压缩后的最大长度 */
  compressLength?: number;
  /** 追问检测正则表达式 */
  followUpPatterns?: RegExp;
}

/**
 * 智能过滤聊天历史
 * @param chat 用户当前输入
 * @param messages 历史消息列表
 * @param options 配置选项
 * @returns 过滤并压缩后的消息列表
 */
export function filterChatHistory(
  chat: string,
  messages: Array<MemoMessage>,
  options: FilterOptions = {}
): Array<{ role: 'user' | 'assistant'; content: string; created_at: number }> {
  const {
    followUpWindow = 8,      // 追问时保留8条
    newTopicWindow = 3,      // 新话题只保留3条
    defaultWindow = 6,       // 默认6条
    compressLength = 80,     // 历史AI回复压缩到 80 字符
    followUpPatterns = /(这个|那个|然后呢|为什么|怎么说|详细|继续|接着|后来|之后)/,
  } = options;

  logDebug('[HistoryFilter] 开始过滤聊天历史', {
    inputLength: chat.length,
    totalMessages: messages.length,
  });

  // 1. 检测对话阶段
  const isFollowUp = detectFollowUp(chat, followUpPatterns);
  const isNewTopic = detectNewTopic(chat);

  // 2. 确定窗口大小
  let windowSize = defaultWindow;
  if (isFollowUp) {
    windowSize = followUpWindow;
    logDebug('[HistoryFilter] 检测到追问场景，扩大窗口至', windowSize);
  } else if (isNewTopic) {
    windowSize = newTopicWindow;
    logDebug('[HistoryFilter] 检测到新话题，缩小窗口至', windowSize);
  }

  // 3. 基础过滤：只保留 user/assistant/summary，按时间排序
  const validMessages = messages
    .filter((msg): msg is MemoMessage & { role: 'user' | 'assistant' | 'summary' } =>
      msg.role === "user" || msg.role === "assistant" || msg.role === "summary"
    )
    .sort((a, b) => a.created_at - b.created_at);

  logDebug('[HistoryFilter] 有效消息过滤完成', {
    validCount: validMessages.length,
    summaryCount: validMessages.filter(m => m.role === 'summary').length,
  });

  // 4. 找到最后一次 summary 消息的位置
  const lastSummaryIndex = findLastSummaryIndex(validMessages);

  // 5. 如果存在 summary 消息，只保留 summary 之后的消息（包括 summary 本身作为上下文）
  let messagesAfterSummary = validMessages;
  if (lastSummaryIndex >= 0) {
    // 保留最后一条 summary 及之后的消息
    messagesAfterSummary = validMessages.slice(lastSummaryIndex);
    logDebug('[HistoryFilter] 找到最后一条总结消息，只保留之后的数据', {
      lastSummaryIndex,
      totalMessages: validMessages.length,
      keptMessages: messagesAfterSummary.length
    });
  } else {
    logDebug('[HistoryFilter] 未找到总结消息，使用全部有效消息');
  }

  // 6. 智能压缩处理
  const processedMessages = compressHistory(messagesAfterSummary, compressLength);

  // 7. 截取窗口
  const result = processedMessages.slice(-windowSize);

  logDebug('[HistoryFilter] 过滤完成', {
    resultCount: result.length,
    windowSize,
    isFollowUp,
    isNewTopic,
  });

  return result;
}

/**
 * 找到最后一次 summary 消息的索引
 */
function findLastSummaryIndex(
  messages: Array<MemoMessage & { role: 'user' | 'assistant' | 'summary' }>
): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg && msg.role === 'summary') {
      return i;
    }
  }
  return -1;
}

/**
 * 检测是否为追问（需要更多上下文）
 */
function detectFollowUp(chat: string, pattern: RegExp): boolean {
  // 短消息 + 包含指代词 = 高概率追问
  const isShortQuery = chat.length < 20;
  const hasReference = pattern.test(chat);

  // 明确的追问词（权重更高）
  const strongFollowUp = /^(那|所以|但是|可是|不过|然后)[，,]?/.test(chat);

  return (isShortQuery && hasReference) || strongFollowUp;
}

/**
 * 检测是否为新话题（可以激进压缩）
 */
function detectNewTopic(chat: string): boolean {
  // 长消息通常是新话题阐述
  if (chat.length > 100) return true;

  // 新话题常见开头
  const newTopicStarters = /^(?:今天|突然|我想|帮我|请问|如果|假设|换个话题|对了|说起|提到)/;
  return newTopicStarters.test(chat);
}

/**
 * 压缩历史消息：只保留最后一条AI回复完整，其余截断
 * summary 类型的消息会被转换为 system 角色的上下文提示
 */
function compressHistory(
  messages: Array<MemoMessage & { role: 'user' | 'assistant' | 'summary' }>,
  maxLength: number
): Array<{ role: 'user' | 'assistant'; content: string; created_at: number }> {

  // 找到最后一条AI消息的位置
  const lastAssistantIndex = messages.map(m => m.role).lastIndexOf('assistant');

  return messages.map((msg, index) => {
    // summary 消息转换为 system 上下文提示
    if (msg.role === 'summary') {
      return { 
        role: 'assistant', 
        content: `[对话历史总结] ${msg.content}`,
        created_at: msg.created_at 
      };
    }

    // 用户消息不压缩
    if (msg.role === 'user') {
      return { role: msg.role, content: msg.content, created_at: msg.created_at };
    }

    // 最后一条AI消息保持完整（如果是倒数第二条以内，也保留，避免太短）
    if (index >= lastAssistantIndex - 1) {
      return { role: msg.role, content: msg.content, created_at: msg.created_at };
    }

    // 历史AI消息压缩
    const compressed = msg.content.length > maxLength
      ? msg.content.slice(0, maxLength) + `...[此前已回复，共${msg.content.length}字]`
      : msg.content;

    return {
      role: msg.role,
      content: `[历史] ${compressed}`,
      created_at: msg.created_at
    };
  });
}
