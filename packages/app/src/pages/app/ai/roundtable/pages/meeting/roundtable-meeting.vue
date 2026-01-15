<template>
  <div class="roundtable-meeting">
    <div class="rm-header">
      <div class="rm-title">{{ meeting?.topic }}</div>
      <div class="rm-controls">
        <t-radio-group v-model="page" variant="default-filled">
          <t-radio-button value="1">消息</t-radio-button>
          <t-radio-button value="2">成员</t-radio-button>
          <t-radio-button value="3">设置</t-radio-button>
        </t-radio-group>
      </div>
    </div>
    <div class="rm-content">
      <div v-if="page === '1'" class="rm-messages">
        <meeting-message :is-stream-load="isStreamLoad" :messages="messages" :participant-map="participantMap"
                         ref="chatContentRef" @scroll="handleChatScroll"/>
        <div class="chat-sender-wrapper">
          <div class="chat-sender">
            <t-chat-sender v-model="text" placeholder="输入消息..." :loading="isSpeaking" @send="handleSend" @stop="handleInterrupt">
              <template #footer-prefix>
                <t-space size="small">
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
                </t-space>
              </template>
            </t-chat-sender>
          </div>
        </div>
      </div>
      <meeting-participant v-else-if="page === '2'" :participants="participants"
                           :current-participant-id="currentParticipantId" @change="fetchParticipant"/>
      <meeting-setting v-else-if="page === '3' && meeting" :meeting="meeting" @change="handleMeetingChange"/>
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
  PauseIcon,
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
import MeetingParticipant from "@/pages/app/ai/roundtable/pages/meeting/comp/MeetingParticipant.vue";
import MeetingMessage from "@/pages/app/ai/roundtable/pages/meeting/comp/MeetingMessage.vue";
import MeetingSetting from "@/pages/app/ai/roundtable/pages/meeting/comp/MeetingSetting.vue";

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

const currentParticipantIndex = ref(0);
const currentParticipantId = ref('');

const fetchParticipant = async () => {
  participants.value = await listAiRtParticipantService('meeting', meetingId.value);
  participantMap.value = map(participants.value, 'id');
}

const fetchMeeting = async () => {
  meeting.value = await getAiRtMeetingService(meetingId.value) || undefined;
}

tryOnMounted(async () => {
  const url = new URL(`https://example.com${activeKey.value}`)
  const item = url.pathname.split("/");
  meetingId.value = item.pop()!;
  groupId.value = item.pop()!;
  // 获取圆桌会议基础信息
  await fetchMeeting();
  messages.value = await listAiRtMessageService(meetingId.value);
  // 获取全部成员
  await fetchParticipant();

  isPaused.value = meeting.value?.status === 'paused';

  const mode = url.searchParams.get('mode');
  if (mode === 'create') {
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
    await updateAiRtMeetingService(meetingId.value, {status: 'paused'});
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

    // 插入新纪录
    const messageId = await addAiRtMessageService(meetingId.value, {
      role: 'assistant',
      thinking: '',
      content: '',
      participant_id: participant.id,
      is_summary: 0,
      is_interrupted: 0,
      parent_message_id: ''
    });
    // 刷新消息列表
    messages.value = await listAiRtMessageService(meetingId.value);

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
      onStart: () => {
      },
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
    await updateAiRtMeetingService(meetingId.value, {status: 'active'});
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
  await updateAiRtMeetingService(meetingId.value, {status: 'paused'});
  if (abort.value) {
    abort.value.abort('用户暂停');
  }
  isSpeaking.value = false;
  isStreamLoad.value = false;
};

const handleResume = async () => {
  isPaused.value = false;
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

const handleMeetingChange = async () => {
  await fetchMeeting();
  page.value = '1';
}
</script>
<style scoped lang="less">
@import "./roundtable-meeting.less";
</style>
