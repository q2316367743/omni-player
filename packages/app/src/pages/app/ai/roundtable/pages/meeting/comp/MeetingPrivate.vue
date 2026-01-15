<template>
  <t-layout style="height: calc(100vh - 49px)">
    <t-aside style="border-right: 1px solid var(--td-border-level-1-color)">
      <t-menu v-model="participantId">
        <t-menu-item v-for="p in participants" :key="p.id" :value="p.id">{{ p.name }}</t-menu-item>
      </t-menu>
    </t-aside>
    <t-content>
      <meeting-private-chat v-if="participant" :participant="participant" :meeting="meeting" :messages="messages"
                            :participant-map="participantMap" @refresh="onRefresh"/>
      <empty-result v-else/>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import type {AiRtMeeting, AiRtMessage, AiRtParticipant} from "@/entity/app/ai/roundtable";
import MeetingPrivateChat from "@/pages/app/ai/roundtable/pages/meeting/comp/MeetingPrivateChat.vue";

const props = defineProps({
  messages: {
    type: Array as PropType<Array<AiRtMessage>>,
    required: true
  },
  participants: {
    type: Array as PropType<Array<AiRtParticipant>>,
    required: true
  },
  meeting: {
    type: Object as PropType<AiRtMeeting>,
    required: true
  },
  participantMap: {
    type: Object as PropType<Map<string, AiRtParticipant>>,
    required: true
  }
})
const participantId = ref('');
const emit = defineEmits(['refresh']);

const participant = computed(() => {
  return props.participants.find(p => p.id === participantId.value);
})

const onRefresh = () => {
  emit('refresh');
}
</script>
<style scoped lang="less">
:deep(.t-layout) {
  height: 100%;
}

:deep(.t-aside) {
  width: 240px;
  border-right: 1px solid var(--td-border-level-1-color);
  overflow-y: auto;
}

:deep(.t-content) {
  flex: 1;
  height: 0;
  overflow: hidden;
}
</style>
