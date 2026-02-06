import { nextTick } from 'vue';
import type { MemoMessage, MemoMessageCore } from '@/entity/memo';
import { saveMemoMessage } from '@/services/memo/MemoMessageService';
import type { MemoFriendView } from '@/entity/memo';
import { logDebug, logError } from '@/lib/log';

// 中间总结阈值：达到此数量的 user/assistant 消息时触发中间总结
export const MID_SUMMARY_THRESHOLD = 20;

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 创建防抖保存消息函数
 */
export function createDebouncedSaveMessage(wait: number = 1000) {
  return debounce(async (message: MemoMessageCore, created_at?: number) => {
    try {
      await saveMemoMessage(message, created_at);
      logDebug('[MemoChat] 消息已保存', { role: message.role, created_at });
    } catch (error) {
      logError('[MemoChat] 保存消息失败', error);
    }
  }, wait);
}

/**
 * 滚动元素到底部
 */
export function scrollToBottom(element: HTMLElement | undefined) {
  nextTick(() => {
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  });
}

/**
 * 检查是否需要触发中间总结
 * @returns 是否需要总结
 */
export function shouldTriggerMidSummary(messages: MemoMessage[]): boolean {
  const userAssistantMessages = messages.filter(
    (m) => m.role === 'user' || m.role === 'assistant'
  );

  logDebug('[MidSummary] 检查是否需要中间总结', {
    totalMessages: messages.length,
    userAssistantCount: userAssistantMessages.length,
    threshold: MID_SUMMARY_THRESHOLD,
  });

  // 如果消息数未达到阈值，不需要总结
  if (userAssistantMessages.length < MID_SUMMARY_THRESHOLD) {
    logDebug('[MidSummary] 消息数未达到阈值，跳过总结');
    return false;
  }

  // 检查是否已经有 summary 消息
  const hasSummary = messages.some((m) => m.role === 'summary');
  if (hasSummary) {
    // 找到最后一条 summary 之后的消息数量
    const lastSummaryIndex = messages.map((m) => m.role).lastIndexOf('summary');
    const messagesAfterLastSummary = messages
      .slice(lastSummaryIndex + 1)
      .filter((m) => m.role === 'user' || m.role === 'assistant');

    logDebug('[MidSummary] 已有总结消息', {
      lastSummaryIndex,
      messagesAfterLastSummary: messagesAfterLastSummary.length,
    });

    // 如果最后一条 summary 之后的消息不足阈值，不需要新的总结
    if (messagesAfterLastSummary.length < MID_SUMMARY_THRESHOLD) {
      logDebug('[MidSummary] 上次总结后消息数不足，跳过总结');
      return false;
    }
  }

  logDebug('[MidSummary] 需要触发中间总结');
  return true;
}

/**
 * 获取需要总结的消息范围
 */
export function getMessagesToSummarize(messages: MemoMessage[]): MemoMessage[] {
  const lastSummaryIndex = messages.map((m) => m.role).lastIndexOf('summary');

  if (lastSummaryIndex >= 0) {
    // 总结最后一条 summary 之后的所有 user/assistant 消息
    const result = messages
      .slice(lastSummaryIndex + 1)
      .filter((m) => m.role === 'user' || m.role === 'assistant');
    logDebug('[MidSummary] 获取上次总结后的消息', {
      lastSummaryIndex,
      messageCount: result.length,
    });
    return result;
  } else {
    // 总结所有 user/assistant 消息
    const result = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
    logDebug('[MidSummary] 获取所有消息进行总结', { messageCount: result.length });
    return result;
  }
}

export interface MidSummaryContext {
  messages: MemoMessage[];
  friend: MemoFriendView;
  sessionId: string;
  isGenerating: { value: boolean };
}

export interface MidSummaryResult {
  success: boolean;
  summaryMessage?: MemoMessage;
}


/**
 * 生成用户消息的 created_at
 * 确保在 summary 之后
 */
export function generateUserMessageTimestamp(messages: MemoMessage[]): number {
  const lastMessage = messages[messages.length - 1];
  const timestamp = lastMessage ? Math.max(Date.now(), lastMessage.created_at + 1) : Date.now();
  logDebug('[MemoChat] 生成用户消息时间戳', {
    lastMessageTime: lastMessage?.created_at,
    generatedTime: timestamp,
  });
  return timestamp;
}
