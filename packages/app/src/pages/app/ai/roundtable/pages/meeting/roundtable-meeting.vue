<template>
  <div class="roundtable-meeting">
    <div class="rm-header">
      <div>{{ meeting?.topic }}</div>
      <t-radio-group v-model="page">
        <t-radio value="1">消息</t-radio>
        <t-radio value="2">成员</t-radio>
      </t-radio-group>
    </div>
    <div class="rm-content"></div>
  </div>
</template>
<script lang="ts" setup>
import type {AiRtMeeting, AiRtMessage, AiRtParticipant} from "@/entity/app/ai/roundtable";
import {getAiRtMeetingService, listAiRtMessageService, listAiRtParticipantService} from "@/services/app/roundtable";

const activeKey = defineModel({
  type: String,
  default: '/create/0'
})

const meetingId = ref('');
const groupId = ref('');

const meeting = ref<AiRtMeeting>();
const messages = ref<Array<AiRtMessage>>([]);
const participants = ref<Array<AiRtParticipant>>([]);

const page = ref('1');

tryOnMounted(async () => {
  const url = new URL(`https://example.com${activeKey.value}`)
  const item = url.pathname.split("/");
  meetingId.value = item.pop()!;
  groupId.value = item.pop()!;
  meeting.value = await getAiRtMeetingService(meetingId.value) || undefined;
  messages.value = await listAiRtMessageService(meetingId.value);
  participants.value = await listAiRtParticipantService('meeting', meetingId.value)
  const mode = url.searchParams.get('mode');
  if (mode === 'create'){
    //代表新创建，立即开始对话
  }
})
</script>
<style scoped lang="less">
.roundtable-meeting {
  width: 100%;
  height: 100vh;

  .rm-header {
    height: 48px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    justify-content: space-between;
  }

  .rm-content {
    height: calc(100vh - 49px);
  }
}
</style>
