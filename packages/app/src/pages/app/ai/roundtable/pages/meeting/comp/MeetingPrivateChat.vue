<template>
  <div class="private-chat">
    <div class="chat-header">
      <div class="participant-info">
        <div class="avatar">
          <user-icon/>
        </div>
        <div class="info">
          <div class="name">{{ participant.name }}</div>
          <div class="status">私聊中</div>
        </div>
      </div>
    </div>
    <div class="chat-content" ref="chatContentRef" @scroll="handleChatScroll">
      <div v-for="(item, index) in privateMessages" :key="item.id" class="chat-item" :class="[item.role]">
        <div v-if="item.role === 'private-assistant'" class="assistant-message">
          <div class="message-avatar assistant-avatar">
            <internet-icon/>
          </div>
          <div class="message-body">
            <div v-if="item.thinking && item.thinking.length > 0" class="thinking-section">
              <div class="thinking-header">
                <check-circle-icon v-if="!isStreamLoad || index !== privateMessages.length - 1" class="thinking-icon"/>
                <div v-else class="thinking-loading">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
                <span class="thinking-text">{{
                    isStreamLoad && index === privateMessages.length - 1 ? '思考中...' : '已深度思考'
                  }}</span>
              </div>
              <div class="thinking-content">{{ item.thinking }}</div>
            </div>
            <div v-if="item.content" class="message-content">
              <markdown-preview :content="item.content"/>
            </div>
          </div>
        </div>
        <div v-else-if="item.role === 'private-user'" class="user-message">
          <div class="message-body">
            <div class="message-content">
              <markdown-preview :content="item.content"/>
            </div>
          </div>
          <div class="message-avatar user-avatar">
            <user-icon/>
          </div>
        </div>
      </div>
    </div>
    <div v-if="meeting.status !== 'ended'" class="chat-sender-wrapper">
      <div class="chat-sender">
        <t-chat-sender v-model="text" placeholder="输入私聊消息...">
          <template #suffix>
            <t-button v-if="isSpeaking" shape="round" theme="danger" @click="handleInterrupt">
              <template #icon>
                <stop-circle-icon/>
              </template>
              停止
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
    <t-button v-if="isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
      <arrow-down-icon/>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import {
  ArrowDownIcon,
  CheckCircleIcon,
  InternetIcon,
  UserIcon,
  SendIcon,
  StopCircleIcon,
} from "tdesign-icons-vue-next";
import {
  type AiRtMeeting,
  type AiRtMessage,
  type AiRtParticipant,
  transferRtPrivateMessageTo
} from "@/entity/app/ai/roundtable";
import {
  addAiRtMessageService,
  updateAiRtMessageService
} from "@/services/app/roundtable/AiRtMessageService";
import {askToOpenAi, type AskToOpenAiAbort} from "@/util/lang/ChatUtil";
import {debounce} from "es-toolkit";

const props = defineProps({
  messages: {
    type: Array as PropType<Array<AiRtMessage>>,
    required: true
  },
  meeting: {
    type: Object as PropType<AiRtMeeting>,
    required: true
  },
  participant: {
    type: Object as PropType<AiRtParticipant>,
    required: true
  },
  participantMap: {
    type: Object as PropType<Map<string, AiRtParticipant>>,
    required: true
  }
})

const emit = defineEmits(['refresh']);

const text = ref('');
const chatContentRef = ref();
const abort = shallowRef<AskToOpenAiAbort>();

const isSpeaking = ref(false);
const isStreamLoad = ref(false);
const isShowToBottom = ref(false);
const isAtBottom = ref(true);

const privateMessages = computed(() => {
  return props.messages.filter(m =>
    (m.role === 'private-assistant' || m.role === 'private-user') &&
    m.participant_id === props.participant.id
  );
});

const handleSend = async () => {
  if (!text.value.trim()) return;

  const content = text.value;
  text.value = '';

  await addAiRtMessageService(props.meeting.id, {
    role: 'private-user',
    thinking: '',
    content,
    participant_id: props.participant.id,
    is_summary: 0,
    is_interrupted: 0,
    parent_message_id: ''
  });

  emit('refresh');
  await nextTick();

  await askAssistant();
};

const askAssistant = async () => {
  try {
    isSpeaking.value = true;
    isStreamLoad.value = true;

    const messageId = await addAiRtMessageService(props.meeting.id, {
      role: 'private-assistant',
      thinking: '',
      content: '',
      participant_id: props.participant.id,
      is_summary: 0,
      is_interrupted: 0,
      parent_message_id: ''
    });

    emit('refresh');
    await nextTick();

    const onUpdateMessage = debounce(async (data: { thinking?: string; content?: string }) => {
      await updateAiRtMessageService(messageId!, data);
    }, 300);

    const currentMessages = transferRtPrivateMessageTo(
      props.messages,
      props.meeting,
      props.participant,
      props.participantMap
    );

    await askToOpenAi({
      messages: currentMessages,
      assistant: {
        model: props.participant.model,
        temperature: props.participant.temperature,
        topP: 0.9
      },
      onStart: () => {
      },
      onAppend: (data, t) => {
        if (!data) return;
        const msgs = privateMessages.value;
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (!lastMsg) return;
          if (t) {
            lastMsg.thinking += data;
          } else {
            lastMsg.content += data;
            isStreamLoad.value = false;
          }
          if (isAtBottom.value) {
            nextTick(() => {
              backBottom();
            });
          }
          onUpdateMessage(lastMsg);
        }
      },
      onAborted: (a) => {
        abort.value = a;
      }
    });
    setTimeout(() => {
      emit('refresh');
    }, 310);
  } catch (e) {
    console.error('AI响应失败', e);
  } finally {
    isSpeaking.value = false;
    isStreamLoad.value = false;
  }
};

const handleInterrupt = () => {
  if (abort.value) {
    abort.value.abort('用户停止');
  }
  isSpeaking.value = false;
  isStreamLoad.value = false;
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

watch(() => props.messages, () => {
  nextTick(() => {
    backBottom();
  });
}, {deep: true});

onMounted(() => {
  nextTick(() => {
    backBottom();
  });
});
</script>
<style scoped lang="less">
@import "./MeetingPrivateChat.less";
</style>
