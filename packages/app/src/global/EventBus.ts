
export interface AppAiChatRenameProp {
  groupId: string;
  chatId: string;
}

export const appAiChatRename = useEventBus<AppAiChatRenameProp>('/app/ai/chat/rename');