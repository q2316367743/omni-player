import type {MemoFriendStaticView, MemoMessage, MemoSession} from "@/entity/memo";
import {logDebug, logError} from "@/lib/log.ts";
import {completeMemoFriendSession, completeMemoSession, getMemoSession, listMemoMessage} from "@/services/memo";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useMemoFriendStore} from "@/store";
import {
  createDebouncedSaveMessage,
  generateUserMessageTimestamp,
  scrollToBottom
} from "@/pages/memo/chat/utils.ts";
import {aiMemoSession, aiMemoSessionSummary, type ChatSummaryResult} from "@/modules/ai/memo";
import type {AskToOpenAiAbort} from "@/modules/ai";

export interface MemoChatFuncResult {
  friend: Ref<MemoFriendStaticView>;
  session: Ref<MemoSession>;
  messages: Ref<Array<MemoMessage>>;
  summaryData: Ref<ChatSummaryResult | undefined>;

  // 状态
  isLoading: Ref<boolean>;
  isGeneratingMidSummary: Ref<boolean>;
  isEnding: Ref<boolean>;
  showSummary: Ref<boolean>;

  handleSend: (content: string) => Promise<void>;
  handleEndChat: () => Promise<void>;
  init: (container: HTMLElement | undefined) => Promise<void>;
}

export async function memoChatFunc(sessionId: string): Promise<MemoChatFuncResult> {

  const isLoading = ref(false);
  const abortController = shallowRef<AskToOpenAiAbort>();
  const isGeneratingMidSummary = ref(false);
  const isEnding = ref(false);
  const showSummary = ref(false);
  const summaryData = ref<ChatSummaryResult>();

// 防抖保存消息
  const debouncedSaveMessage = createDebouncedSaveMessage();

  logDebug('[MemoChat] 组件挂载，开始初始化', {sessionId});

  // 获取 session
  const s = await getMemoSession(sessionId);
  if (!s) {
    logError('[MemoChat] 会话不存在', {sessionId: sessionId});
    return Promise.reject(new Error("会话不存在"));
  }
  logDebug('[MemoChat] 会话已获取', {sessionId});
  const session = ref<MemoSession>(s);

  // 获取朋友
  const f = useMemoFriendStore().friends.find((e) => e.id === session.value?.friend_id);
  if (!f) {
    logError('[MemoChat] 朋友不存在', {friendId: session.value?.friend_id});
    return Promise.reject(new Error("朋友不存在"));
  }
  const friend = ref<MemoFriendStaticView>(f);
  logDebug('[MemoChat] 朋友信息已获取', {friendId: friend.value.id, friendName: friend.value.name});

  // 获取聊天记录
  const messages = ref(await listMemoMessage(session.value.id));
  logDebug('[MemoChat] 聊天记录已加载', {messageCount: messages.value.length});

  logDebug('[MemoChat] 组件初始化完成');

  const messagesContainer = ref<HTMLElement>();

  async function init(container: HTMLElement | undefined) {
    messagesContainer.value = container;

    scrollToBottom(container);
    const f = await useMemoFriendStore().fetchFriend(friend.value.id);

    if (messages.value.length === 0) {
      logDebug('[MemoChat] 首次对话，开始初始化 AI 问候');
      // 第一次，需要直接获取
      isLoading.value = true;
      try {
        let assistantMessageContent = '';
        await aiMemoSession({
          friend: f!,
          chat: '',
          messages: messages.value,
          onStart: async () => {
            logDebug('[MemoChat] AI 问候开始');
          },
          onAborted: (controller) => {
            abortController.value = controller;
          },
          onMessage: async (data) => {
            assistantMessageContent += data;
            // 实时更新消息内容
            const lastMessage = messages.value[messages.value.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = assistantMessageContent;
            } else {
              // 添加新的助手消息
              const assistantMessage: MemoMessage = {
                id: Date.now().toString(),
                session_id: session.value!.id,
                role: 'assistant',
                content: assistantMessageContent,
                created_at: Date.now(),
                updated_at: Date.now(),
              };
              messages.value.push(assistantMessage);
            }
            scrollToBottom(container);
          },
          onError: async (e) => {
            logError('[MemoChat] AI 问候错误', e);
            const errorMessage = e?.message || '聊天出错，请重试';
            MessageUtil.error(errorMessage);
            const errorCreatedAt = Date.now();
            const errorMessageObj: MemoMessage = {
              id: (Date.now() + 2).toString(),
              session_id: session.value!.id,
              role: 'error',
              content: errorMessage,
              created_at: errorCreatedAt,
              updated_at: errorCreatedAt,
            };
            messages.value.push(errorMessageObj);
            scrollToBottom(container);
            debouncedSaveMessage({
              session_id: session.value!.id,
              role: 'error',
              content: errorMessage,
            }, errorCreatedAt);
          },
          onFinally: async () => {
            isLoading.value = false;
            logDebug('[MemoChat] AI 问候完成', {contentLength: assistantMessageContent.length});
            // 保存助手消息
            if (assistantMessageContent) {
              debouncedSaveMessage({
                session_id: session.value!.id,
                role: 'assistant',
                content: assistantMessageContent,
              });
            }
          },
        });
      } catch (error) {
        logError('[MemoChat] 初始化聊天失败', error);
        MessageUtil.error('初始化聊天失败，请重试');
        isLoading.value = false;
      }
    }
  }

  async function handleSend(content: string) {
    if (!content || isLoading.value || !friend.value || !session.value) return;

    logDebug('[MemoChat] 开始发送消息', { contentLength: content.length });

    // 生成用户消息的 created_at：确保在 summary 之后
    const userCreatedAt = generateUserMessageTimestamp(messages.value);

    // 添加用户消息
    const userMessage: MemoMessage = {
      id: Date.now().toString(),
      session_id: session.value.id,
      role: 'user',
      content,
      created_at: userCreatedAt,
      updated_at: userCreatedAt,
    };
    messages.value.push(userMessage);
    scrollToBottom(messagesContainer.value);

    logDebug('[MemoChat] 用户消息已添加到本地', { createdAt: userCreatedAt });

    // 保存用户消息
    debouncedSaveMessage(
      {
        session_id: session.value.id,
        role: 'user',
        content,
      },
      userCreatedAt
    );

    // 开始 AI 回复
    isLoading.value = true;
    logDebug('[MemoChat] 开始调用 AI 回复');

    try {
      let assistantMessageContent = '';
      const f = await useMemoFriendStore().fetchFriend(friend.value.id);
      await aiMemoSession({
        friend: f!,
        chat: content,
        messages: messages.value,
        onStart: async () => {
          logDebug('[MemoChat] AI 回复开始');
        },
        onAborted: (controller) => {
          abortController.value = controller;
        },
        onMessage: async (data) => {
          assistantMessageContent += data;
          // 实时更新消息内容
          const lastMessage = messages.value[messages.value.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = assistantMessageContent;
          } else {
            // 添加新的助手消息
            const assistantMessage: MemoMessage = {
              id: (Date.now() + 1).toString(),
              session_id: session.value!.id,
              role: 'assistant',
              content: assistantMessageContent,
              created_at: Date.now(),
              updated_at: Date.now(),
            };
            messages.value.push(assistantMessage);
          }
          scrollToBottom(messagesContainer.value);
        },
        onError: async (e) => {
          logError('[MemoChat] AI 回复错误', e);
          const errorMessage = e?.message || '聊天出错，请重试';
          MessageUtil.error(errorMessage);
          const errorCreatedAt = Date.now();
          const errorMessageObj: MemoMessage = {
            id: (Date.now() + 2).toString(),
            session_id: session.value!.id,
            role: 'error',
            content: errorMessage,
            created_at: errorCreatedAt,
            updated_at: errorCreatedAt,
          };
          messages.value.push(errorMessageObj);
          scrollToBottom(messagesContainer.value);
          debouncedSaveMessage({
            session_id: session.value!.id,
            role: 'error',
            content: errorMessage,
          }, errorCreatedAt);
        },
        onFinally: async () => {
          isLoading.value = false;
          logDebug('[MemoChat] AI 回复完成', { contentLength: assistantMessageContent.length });
          // 保存助手消息
          if (assistantMessageContent) {
            debouncedSaveMessage({
              session_id: session.value!.id,
              role: 'assistant',
              content: assistantMessageContent,
            });
          }
        },
      });
    } catch (error) {
      logError('[MemoChat] 发送消息失败', error);
      MessageUtil.error('发送失败，请重试', error);
      isLoading.value = false;
    }
  }


  async function handleEndChat() {
    if (!friend.value || messages.value.length === 0) {
      MessageUtil.warning('暂无聊天记录可总结');
      return;
    }

    isEnding.value = true;
    try {
      const f = await useMemoFriendStore().fetchFriend(friend.value.id);
      summaryData.value = await aiMemoSessionSummary({
        friend: f!,
        sessionId: session.value!.id,
        messages: messages.value,
      });
      showSummary.value = true;

      if (session.value) {
        await completeMemoSession(session.value.id);
        await completeMemoFriendSession(friend.value.id);
        // 刷新 session 信息
        await useMemoFriendStore().loadChatSession();
        // 刷新朋友信息
        await useMemoFriendStore().loadFriends();
      }
    } catch (error) {
      console.error('总结失败:', error);
      MessageUtil.error('总结失败，请重试');
    } finally {
      isEnding.value = false;
    }
  }


  return {
    friend,
    session,
    messages,

    isLoading,
    isEnding,
    isGeneratingMidSummary,
    showSummary,
    summaryData,

    init,
    handleSend,
    handleEndChat
  };
}