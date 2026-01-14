<template>
  <div class="roundtable-meeting">
    <div class="rm-header">
      <div class="rm-title">{{ meeting?.topic }}</div>
      <div class="rm-controls">
        <t-radio-group v-model="page" variant="default-filled">
          <t-radio value="1">消息</t-radio>
          <t-radio value="2">成员</t-radio>
        </t-radio-group>
      </div>
    </div>
    <div class="rm-content">
      <div v-if="page === '1'" class="rm-messages">
        <div class="chat-list" ref="chatContentRef" @scroll="handleChatScroll">
          <div v-for="(item, index) in messages" :key="item.id" class="chat-item" :class="[item.role]">
            <div v-if="item.role === 'system'" class="system-message">
              <div class="system-content">{{ item.content }}</div>
            </div>
            <div v-else-if="item.role === 'assistant'" class="assistant-message">
              <div class="message-avatar assistant-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div class="message-body">
                <div class="participant-name">{{ getParticipantName(item.participant_id) }}</div>
                <div v-if="item.thinking && item.thinking.length > 0" class="thinking-section">
                  <div class="thinking-header">
                    <check-circle-icon v-if="!isStreamLoad || index !== messages.length - 1" class="thinking-icon"/>
                    <div v-else class="thinking-loading">
                      <span class="dot"></span>
                      <span class="dot"></span>
                      <span class="dot"></span>
                    </div>
                    <span class="thinking-text">{{ isStreamLoad && index === messages.length - 1 ? '思考中...' : '已深度思考' }}</span>
                  </div>
                  <div class="thinking-content">{{ item.thinking }}</div>
                </div>
                <div v-if="item.content" class="message-content">{{ item.content }}</div>
              </div>
            </div>
            <div v-else-if="item.role === 'user'" class="user-message">
              <div class="message-body">
                <div class="message-content">{{ item.content }}</div>
              </div>
              <div class="message-avatar user-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-sender-wrapper">
          <div class="chat-sender">
            <t-textarea
              v-model="text"
              :autosize="{ minRows: 1, maxRows: 6 }"
              placeholder="输入消息..."
              :disabled="isPaused || isSpeaking"
              @keydown.enter.prevent="handleSend"
            />
            <div class="sender-actions">
              <t-space size="small">
                <t-button
                  v-if="isSpeaking"
                  theme="danger"
                  variant="outline"
                  @click="handleInterrupt"
                >
                  <template #icon>
                    <stop-icon/>
                  </template>
                  打断
                </t-button>
                <t-button
                  v-if="isPaused"
                  theme="primary"
                  @click="handleResume"
                >
                  <template #icon>
                    <play-icon/>
                  </template>
                  继续
                </t-button>
                <t-button
                  v-else
                  theme="warning"
                  @click="handlePause"
                >
                  <template #icon>
                    <pause-icon/>
                  </template>
                  暂停
                </t-button>
                <t-button
                  theme="primary"
                  :disabled="!text.trim() || isSpeaking"
                  @click="handleSend"
                >
                  <template #icon>
                    <chat-icon/>
                  </template>
                  发言
                </t-button>
              </t-space>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="rm-participants">
        <div v-for="participant in participants" :key="participant.id" class="participant-card">
          <div class="participant-header">
            <div class="participant-avatar">{{ participant.name.charAt(0) }}</div>
            <div class="participant-info">
              <div class="participant-name">{{ participant.name }}</div>
              <div class="participant-type">{{ participant.type }}</div>
            </div>
            <t-tag v-if="currentParticipantId === participant.id" theme="success" size="small">发言中</t-tag>
            <t-tag v-else-if="participant.is_active === 0" theme="default" size="small">已禁言</t-tag>
            <t-tag v-else theme="default" size="small">等待中</t-tag>
          </div>
          <div class="participant-body">
            <div class="participant-stance" v-if="participant.stance">立场：{{ participant.stance }}</div>
            <div class="participant-prompt">{{ participant.prompt }}</div>
          </div>
        </div>
      </div>
    </div>
    <t-button v-if="isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
      <arrow-down-icon/>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import {
  ArrowDownIcon,
  CheckCircleIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  ChatIcon
} from "tdesign-icons-vue-next";
import type {AiRtMeeting, AiRtMessage, AiRtParticipant} from "@/entity/app/ai/roundtable";
import {
  getAiRtMeetingService,
  listAiRtMessageService,
  listAiRtParticipantService,
  updateAiRtMeetingService
} from "@/services/app/roundtable";
import {
  addAiRtMessageService,
  updateAiRtMessageService
} from "@/services/app/roundtable/AiRtMessageService";
import {askToOpenAi, type AskToOpenAiAbort} from "@/util/lang/ChatUtil";
import {transferRtMessageTo} from "@/entity/app/ai/roundtable/AiRtMessage.ts";
import {debounce} from "es-toolkit";
import {map} from "@/util";

const activeKey = defineModel({
  type: String,
  default: '/create/0'
})

const meetingId = ref('');
const groupId = ref('');

const meeting = ref<AiRtMeeting>();
const messages = ref<Array<AiRtMessage>>([]);
const participants = ref<Array<AiRtParticipant>>([]);
const participantMap = ref(new Map<string, AiRtParticipant>());

const page = ref('1');
const text = ref('');
const chatContentRef = ref<HTMLDivElement>();
const abort = shallowRef<AskToOpenAiAbort>();

const isPaused = ref(false);
const isSpeaking = ref(false);
const isStreamLoad = ref(false);
const isShowToBottom = ref(false);
const isAtBottom = ref(true);

const currentParticipantIndex = ref(0);
const currentParticipantId = ref('');

const getParticipantName = (participantId: string) => {
  const participant = participantMap.value.get(participantId);
  return participant ? participant.name : '未知';
};

tryOnMounted(async () => {
  const url = new URL(`https://example.com${activeKey.value}`)
  const item = url.pathname.split("/");
  meetingId.value = item.pop()!;
  groupId.value = item.pop()!;
  meeting.value = await getAiRtMeetingService(meetingId.value) || undefined;
  messages.value = await listAiRtMessageService(meetingId.value);
  participants.value = await listAiRtParticipantService('meeting', meetingId.value)
  participantMap.value = map(participants.value, 'id');
  
  isPaused.value = meeting.value?.status === 'paused';
  
  const mode = url.searchParams.get('mode');
  if (mode === 'create'){
    await startNextParticipant();
  }
  
  await nextTick();
  backBottom();
});

const activeParticipants = computed(() => {
  return participants.value.filter(p => p.is_active === 1);
});

const getNextParticipant = () => {
  const active = activeParticipants.value;
  if (active.length === 0) return null;
  
  const currentIndex = active.findIndex(p => p.id === currentParticipantId.value);
  const nextIndex = (currentIndex + 1) % active.length;
  return active[nextIndex];
};

const startNextParticipant = async () => {
  if (isPaused.value) return;
  
  const participant = getNextParticipant();
  if (!participant) {
    await updateAiRtMeetingService(meetingId.value, { status: 'paused' });
    isPaused.value = true;
    return;
  }
  
  currentParticipantId.value = participant.id;
  currentParticipantIndex.value = participants.value.findIndex(p => p.id === participant.id);
  
  await askParticipant(participant);
};

const askParticipant = async (participant: AiRtParticipant) => {
  if (isPaused.value) return;
  
  try {
    isSpeaking.value = true;
    isStreamLoad.value = true;
    
    const messageId = await addAiRtMessageService(meetingId.value, {
      role: 'assistant',
      thinking: '',
      content: '',
      participant_id: participant.id,
      is_summary: 0,
      is_interrupted: 0,
      parent_message_id: ''
    });
    
    const onUpdateMessage = debounce(async (data: { thinking?: string; content?: string }) => {
      await updateAiRtMessageService(messageId!, data);
    }, 300);
    
    await askToOpenAi({
      messages: transferRtMessageTo(messages.value, meeting.value!, participant, participantMap.value),
      assistant: {
        model: participant.model,
        temperature: participant.temperature,
        topP: 0.9
      },
      onStart: () => {},
      onAppend: (data, t) => {
        if (!data) return;
        if (t) {
          messages.value[messages.value.length - 1]!.thinking += data;
        } else {
          messages.value[messages.value.length - 1]!.content += data;
          isStreamLoad.value = false;
        }
        if (isAtBottom.value) {
          nextTick(() => {
            backBottom();
          });
        }
        onUpdateMessage(messages.value[messages.value.length - 1]!);
      },
      onAborted: (a) => {
        abort.value = a;
      }
    });
    
    messages.value = await listAiRtMessageService(meetingId.value);
    
    if (!isPaused.value) {
      await startNextParticipant();
    }
  } catch (e) {
    console.error('AI发言失败', e);
  } finally {
    isSpeaking.value = false;
    isStreamLoad.value = false;
  }
};

const handleSend = async () => {
  if (!text.value.trim()) return;
  
  const content = text.value;
  text.value = '';
  
  await addAiRtMessageService(meetingId.value, {
    role: 'user',
    thinking: '',
    content,
    participant_id: '',
    is_summary: 0,
    is_interrupted: 0,
    parent_message_id: ''
  });
  
  messages.value = await listAiRtMessageService(meetingId.value);
  
  if (isPaused.value) {
    await updateAiRtMeetingService(meetingId.value, { status: 'active' });
    isPaused.value = false;
    await startNextParticipant();
  }
};

const handleInterrupt = () => {
  if (abort.value) {
    abort.value.abort('用户打断');
  }
  isSpeaking.value = false;
  isStreamLoad.value = false;
};

const handlePause = async () => {
  isPaused.value = true;
  await updateAiRtMeetingService(meetingId.value, { status: 'paused' });
  if (abort.value) {
    abort.value.abort('用户暂停');
  }
  isSpeaking.value = false;
  isStreamLoad.value = false;
};

const handleResume = async () => {
  isPaused.value = false;
  await updateAiRtMeetingService(meetingId.value, { status: 'active' });
  await startNextParticipant();
};

const handleChatScroll = (e: Event) => {
  const target = e.target as HTMLDivElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;
  isShowToBottom.value = scrollHeight - scrollTop - clientHeight > 100;
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 50;
};

const backBottom = () => {
  if (chatContentRef.value) {
    chatContentRef.value.scrollTo({
      top: chatContentRef.value.scrollHeight,
      behavior: 'smooth',
    });
  }
};
</script>
<style scoped lang="less">
.roundtable-meeting {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--td-bg-color-container);

  .rm-header {
    height: 48px;
    padding: 0 16px;
    border-bottom: 1px solid var(--fluent-border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--fluent-acrylic-bg);
    backdrop-filter: var(--fluent-acrylic-blur);
    box-shadow: var(--fluent-elevation-1);

    .rm-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--td-text-color-primary);
    }
  }

  .rm-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .rm-messages {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 24px 16px;

      .chat-list {
        flex: 1;
        overflow-y: auto;
        padding-right: 8px;

        .chat-item {
          max-width: 900px;
          margin: 0 auto 24px;
          transition: all var(--fluent-transition-normal);

          &.system {
            .system-message {
              padding: 12px 16px;
              background: transparent;
              border: 1px solid var(--td-text-color-disabled);
              border-radius: var(--fluent-radius-card);
              color: var(--td-text-color-disabled);
              font-size: 13px;
              line-height: 1.5;
              max-width: 800px;
              margin: 0 auto;

              .system-content {
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }
            }
          }

          &.assistant {
            .assistant-message {
              display: flex;
              gap: 12px;
              max-width: 800px;
              margin: 0 auto;

              .message-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--fluent-gradient-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                color: white;
                box-shadow: var(--fluent-elevation-2);

                svg {
                  width: 24px;
                  height: 24px;
                }
              }

              .message-body {
                flex: 1;
                min-width: 0;

                .participant-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: var(--td-text-color-secondary);
                  margin-bottom: 8px;
                }

                .thinking-section {
                  margin-bottom: 12px;
                  background: var(--fluent-card-bg);
                  backdrop-filter: blur(10px);
                  border: 1px solid var(--fluent-card-border);
                  border-radius: var(--fluent-radius-card);
                  box-shadow: var(--fluent-elevation-1);
                  overflow: hidden;
                  transition: all var(--fluent-transition-normal);

                  &:hover {
                    box-shadow: var(--fluent-elevation-2);
                  }

                  .thinking-header {
                    padding: 12px 16px;
                    background: var(--fluent-item-hover);
                    border-bottom: 1px solid var(--fluent-border-subtle);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;

                    .thinking-icon {
                      color: var(--td-success-color-5);
                      font-size: 20px;
                    }

                    .thinking-loading {
                      display: flex;
                      gap: 4px;

                      .dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: var(--fluent-accent-color);
                        animation: bounce 1.4s infinite ease-in-out both;

                        &:nth-child(1) {
                          animation-delay: -0.32s;
                        }

                        &:nth-child(2) {
                          animation-delay: -0.16s;
                        }
                      }
                    }

                    @keyframes bounce {
                      0%, 80%, 100% {
                        transform: scale(0);
                      }
                      40% {
                        transform: scale(1);
                      }
                    }

                    .thinking-text {
                      font-size: 14px;
                    }
                  }

                  .thinking-content {
                    padding: 16px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--td-text-color-secondary);
                  }
                }

                .message-content {
                  padding: 16px 20px;
                  background: var(--td-bg-color-container);
                  border: 1px solid var(--fluent-card-border);
                  border-radius: var(--fluent-radius-card);
                  font-size: 15px;
                  line-height: 1.7;
                  color: var(--td-text-color-primary);
                  word-wrap: break-word;
                  white-space: pre-wrap;
                }
              }
            }
          }

          &.user {
            .user-message {
              display: flex;
              gap: 12px;
              max-width: 800px;
              margin: 0 auto;
              flex-direction: row-reverse;

              .message-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--fluent-gradient-secondary);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                color: white;
                box-shadow: var(--fluent-elevation-2);

                svg {
                  width: 24px;
                  height: 24px;
                }
              }

              .message-body {
                flex: 1;
                min-width: 0;

                .message-content {
                  padding: 16px 20px;
                  background: var(--td-bg-color-secondarycontainer);
                  backdrop-filter: blur(10px);
                  border: 1px solid var(--fluent-card-border);
                  border-radius: var(--fluent-radius-card);
                  box-shadow: var(--fluent-card-shadow);
                  font-size: 15px;
                  line-height: 1.7;
                  color: var(--td-text-color-primary);
                  word-wrap: break-word;
                  white-space: pre-wrap;
                  transition: all var(--fluent-transition-normal);

                  &:hover {
                    box-shadow: var(--fluent-card-shadow-hover);
                  }
                }
              }
            }
          }
        }
      }

      .chat-sender-wrapper {
        margin-top: 16px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        width: 100%;

        .chat-sender {
          background: var(--fluent-card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--fluent-card-border);
          border-radius: var(--fluent-radius-large);
          box-shadow: var(--fluent-elevation-3);
          padding: 16px;
          transition: all var(--fluent-transition-normal);

          &:hover {
            box-shadow: var(--fluent-elevation-4);
          }

          .sender-actions {
            margin-top: 12px;
            display: flex;
            justify-content: flex-end;
          }
        }
      }
    }

    .rm-participants {
      flex: 1;
      padding: 24px;
      overflow-y: auto;

      .participant-card {
        background: var(--fluent-card-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--fluent-card-border);
        border-radius: var(--fluent-radius-card);
        box-shadow: var(--fluent-card-shadow);
        padding: 16px;
        margin-bottom: 16px;
        transition: all var(--fluent-transition-normal);

        &:hover {
          box-shadow: var(--fluent-card-shadow-hover);
          transform: translateY(-2px);
        }

        .participant-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .participant-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--fluent-gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            font-weight: 600;
            box-shadow: var(--fluent-elevation-2);
          }

          .participant-info {
            flex: 1;

            .participant-name {
              font-size: 16px;
              font-weight: 600;
              color: var(--td-text-color-primary);
            }

            .participant-type {
              font-size: 13px;
              color: var(--td-text-color-secondary);
            }
          }
        }

        .participant-body {
          .participant-stance {
            font-size: 14px;
            color: var(--td-text-color-secondary);
            margin-bottom: 8px;
          }

          .participant-prompt {
            font-size: 13px;
            color: var(--td-text-color-placeholder);
            line-height: 1.6;
          }
        }
      }
    }
  }

  .bottomBtn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 180px;
    padding: 0;
    border: none;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--fluent-card-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--fluent-card-border);
    box-shadow: var(--fluent-elevation-4);
    transition: all var(--fluent-transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;

    &:hover {
      transform: translateX(-50%) translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      background: var(--fluent-card-bg-hover);
    }

    &:active {
      transform: translateX(-50%) translateY(0);
    }

    svg {
      width: 24px;
      height: 24px;
      color: var(--fluent-accent-color);
    }
  }
}
</style>
