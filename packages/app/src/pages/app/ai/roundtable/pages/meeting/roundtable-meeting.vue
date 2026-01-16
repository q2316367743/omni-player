<template>
  <div class="roundtable-meeting">
    <div class="rm-header">
      <div class="rm-title">{{ meeting?.topic }}</div>
      <div class="rm-controls">
        <t-radio-group v-model="page" variant="default-filled">
          <t-radio-button value="1">消息</t-radio-button>
          <t-radio-button value="2">私聊</t-radio-button>
          <t-radio-button value="3">成员</t-radio-button>
          <t-radio-button value="4">设置</t-radio-button>
        </t-radio-group>
      </div>
    </div>
    <div class="rm-content">
      <div v-show="page === '1'" class="rm-messages">
        <meeting-message :is-stream-load="isStreamLoad" :messages="messages" :participant-map="participantMap"
                         ref="chatContentRef" @scroll="handleChatScroll"/>
        <div v-if="meeting?.status !== 'ended'" class="chat-sender-wrapper">
          <div class="chat-sender">
            <t-chat-sender v-model="text" placeholder="输入消息...">
              <template #footer-prefix>
                <t-space size="small">
                  <t-button
                    v-if="isPaused"
                    theme="primary"
                    shape="round"
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
                    shape="round"
                    :loading="isPauseWaiting"
                    :disabled="isPauseWaiting"
                    @click="handlePause"
                  >
                    <template #icon>
                      <pause-icon/>
                    </template>
                    我要发言
                  </t-button>
                </t-space>
              </template>
              <template #suffix>
                <t-button v-if="isSpeaking" shape="round" theme="danger" @click="handleInterrupt">
                  <template #icon>
                    <stop-circle-icon/>
                  </template>
                  打断发言
                </t-button>
                <t-button v-else shape="round" theme="primary" @click="handleSend">
                  <template #icon>
                    <send-icon/>
                  </template>
                  发送
                </t-button>
              </template>
            </t-chat-sender>
          </div>
        </div>
      </div>
      <meeting-private v-show="page === '2'" v-if="meeting" :participants :messages :meeting="meeting"
                       :participant-map="participantMap" @refresh="fetchMessage"/>
      <meeting-participant v-if="page === '3' && meeting" :meeting :participants="participants"
                           :current-participant-id="currentParticipantId" @change="handleParticipantChange"/>
      <meeting-setting v-else-if="page === '4' && meeting" :meeting="meeting" @change="handleMeetingChange"/>
    </div>
    <t-button v-if="isShowToBottom" v-show="page === '1'" variant="text" class="bottomBtn" @click="backBottom">
      <arrow-down-icon/>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import {
  ArrowDownIcon,
  PlayIcon,
  PauseIcon, SendIcon, StopCircleIcon,
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
import {map} from "@/util";
import MeetingParticipant from "@/pages/app/ai/roundtable/pages/meeting/comp/MeetingParticipant.vue";
import MeetingMessage from "@/pages/app/ai/roundtable/pages/meeting/comp/MeetingMessage.vue";
import MeetingSetting from "@/pages/app/ai/roundtable/pages/meeting/comp/MeetingSetting.vue";
import MeetingPrivate from "@/pages/app/ai/roundtable/pages/meeting/comp/MeetingPrivate.vue";

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
const chatContentRef = ref();
const abort = shallowRef<AskToOpenAiAbort>();

const isPaused = ref(false);
const isSpeaking = ref(false);
const isStreamLoad = ref(false);
const isShowToBottom = ref(false);
const isAtBottom = ref(true);
const isPauseWaiting = ref(false);
const interruptedParticipantId = ref('');
const roundsSinceLastInterrupt = ref(0);

const currentParticipantIndex = ref(0);
const currentParticipantId = ref('');

const fetchParticipant = async () => {
  participants.value = await listAiRtParticipantService('meeting', meetingId.value);
  participantMap.value = map(participants.value, 'id');
}

const fetchMeeting = async () => {
  const oldStatus = meeting.value?.status;
  meeting.value = await getAiRtMeetingService(meetingId.value) || undefined;

  if (oldStatus !== 'ended' && meeting.value?.status === 'ended') {
    if (meeting.value.auto_summary_on_end === 1) {
      await triggerAdminSummary();
    }
  }
}

const fetchMessage = async () => {
  messages.value = await listAiRtMessageService(meetingId.value);
}

tryOnMounted(async () => {
  const url = new URL(`https://example.com${activeKey.value}`)
  const item = url.pathname.split("/");
  meetingId.value = item.pop()!;
  groupId.value = item.pop()!;
  // 获取圆桌会议基础信息
  await fetchMeeting();
  // 获取圆桌会议消息
  await fetchMessage();
  // 获取全部成员
  await fetchParticipant();

  isPaused.value = true;

  const mode = url.searchParams.get('mode');
  if (mode === 'create') {
    isPaused.value = false;
    await startNextParticipant();
  }

  await nextTick();
  backBottom();
});

const activeParticipants = computed(() => {
  return participants.value.filter(p => p.is_active === 1 && p.type === 'member');
});

const adminParticipants = computed(() => {
  return participants.value.filter(p => p.type === 'admin');
});

const getCurrentRound = () => {
  return roundsSinceLastInterrupt.value;
};

const triggerAdminSummary = async () => {
  const admins = adminParticipants.value;
  if (admins.length === 0) return;

  const admin = admins[0];
  if (!admin) return;

  try {
    isSpeaking.value = true;
    isStreamLoad.value = true;

    const messageId = await addAiRtMessageService(meetingId.value, {
      role: 'summary',
      thinking: '',
      content: '',
      participant_id: admin.id,
      is_summary: 1,
      is_interrupted: 0,
      parent_message_id: ''
    });
    await fetchMessage();

    let lastSavePromise = Promise.resolve();

    await askToOpenAi({
      messages: transferRtMessageTo(messages.value, meeting.value!, admin, participantMap.value),
      assistant: {
        model: admin.model,
        temperature: admin.temperature,
        topP: 0.9
      },
      onStart: () => {
      },
      onAppend: (data, t) => {
        if (!data) return;
        const lastMessage = messages.value[messages.value.length - 1];
        if (t) {
          lastMessage!.thinking += data;
        } else {
          lastMessage!.content += data;
          isStreamLoad.value = false;
        }
        if (isAtBottom.value) {
          nextTick(() => {
            backBottom();
          });
        }
        lastSavePromise = updateAiRtMessageService(messageId!, {
          thinking: lastMessage!.thinking,
          content: lastMessage!.content
        });
      },
      onAborted: (a) => {
        abort.value = a;
      }
    });

    await lastSavePromise;
    await fetchMessage();

  } catch (e) {
    console.error('管理员AI总结失败', e);
  } finally {
    isSpeaking.value = false;
    isStreamLoad.value = false;
  }
};

const getNextParticipant = () => {
  const active = activeParticipants.value;
  if (active.length === 0) return null;

  const currentIndex = active.findIndex(p => p.id === currentParticipantId.value);
  const nextIndex = (currentIndex + 1) % active.length;
  return active[nextIndex];
};

const startNextParticipant = async () => {
  if (isPaused.value) return;

  const currentRound = getCurrentRound();

  if (meeting.value?.max_rounds && meeting.value.max_rounds > 0 && currentRound >= meeting.value.max_rounds) {
    await updateAiRtMeetingService(meetingId.value, {status: 'paused'});
    isPaused.value = true;
    return;
  }

  const participant = getNextParticipant();
  if (!participant) {
    await updateAiRtMeetingService(meetingId.value, {status: 'paused'});
    isPaused.value = true;
    return;
  }

  currentParticipantId.value = participant.id;
  currentParticipantIndex.value = participants.value.findIndex(p => p.id === participant.id);

  await askParticipant(participant);
};

const askParticipant = async (participant: AiRtParticipant) => {
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
    await fetchMessage();

    let lastSavePromise = Promise.resolve();

    await askToOpenAi({
      messages: transferRtMessageTo(messages.value, meeting.value!, participant, participantMap.value),
      assistant: {
        model: participant.model,
        temperature: participant.temperature,
        topP: 0.9
      },
      onStart: () => {
      },
      onAppend: (data, t) => {
        if (!data) return;
        const lastMessage = messages.value[messages.value.length - 1];
        if (t) {
          lastMessage!.thinking += data;
        } else {
          lastMessage!.content += data;
          isStreamLoad.value = false;
        }
        if (isAtBottom.value) {
          nextTick(() => {
            backBottom();
          });
        }
        lastSavePromise = updateAiRtMessageService(messageId!, {
          thinking: lastMessage!.thinking,
          content: lastMessage!.content
        });
      },
      onAborted: (a) => {
        abort.value = a;
      }
    });

    await lastSavePromise;
    await fetchMessage();

    const active = activeParticipants.value;
    const currentIndex = active.findIndex(p => p.id === participant.id);

    let roundIncreased = false;
    if (currentIndex === active.length - 1) {
      roundsSinceLastInterrupt.value++;
      roundIncreased = true;
    }

    const summaryInterval = meeting.value?.summary_interval || 0;

    if (roundIncreased && summaryInterval > 0) {
      const currentRound = getCurrentRound();
      if (currentRound % summaryInterval === 0) {
        await triggerAdminSummary();
      }
    }

    if (isPauseWaiting.value) {
      isPaused.value = true;
      isPauseWaiting.value = false;
      return;
    }

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

  await fetchMessage();

  if (isPaused.value) {
    roundsSinceLastInterrupt.value = 0;
    await updateAiRtMeetingService(meetingId.value, {status: 'active'});
    isPaused.value = false;

    if (interruptedParticipantId.value) {
      const participant = participants.value.find(p => p.id === interruptedParticipantId.value);
      if (participant) {
        currentParticipantId.value = participant.id;
        currentParticipantIndex.value = participants.value.findIndex(p => p.id === participant.id);
        interruptedParticipantId.value = '';
        await askParticipant(participant);
        return;
      }
    }

    await startNextParticipant();
  }
};

const handleInterrupt = async () => {
  interruptedParticipantId.value = currentParticipantId.value;
  if (abort.value) {
    abort.value.abort('用户打断');
  }
  isSpeaking.value = false;
  isStreamLoad.value = false;
  isPaused.value = true;
  roundsSinceLastInterrupt.value = 0;
  await updateAiRtMeetingService(meetingId.value, {status: 'paused'});
};

const handlePause = async () => {
  isPauseWaiting.value = true;
  await updateAiRtMeetingService(meetingId.value, {status: 'paused'});
};

const handleResume = async () => {
  isPaused.value = false;
  roundsSinceLastInterrupt.value = 0;
  await updateAiRtMeetingService(meetingId.value, {status: 'active'});
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
      top: chatContentRef.value.scrollHeight(),
      behavior: 'smooth',
    });
  }
};

const handleParticipantChange = async (opt: { index: number, participant: AiRtParticipant }) => {
  participants.value[opt.index] = opt.participant;
}

const handleMeetingChange = async () => {
  await fetchMeeting();
  page.value = '1';
}
</script>
<style scoped lang="less">
@import "./roundtable-meeting.less";
</style>
