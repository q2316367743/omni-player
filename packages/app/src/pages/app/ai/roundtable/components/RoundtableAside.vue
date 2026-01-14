<template>
  <div class="roundtable-aside">
    <t-menu v-model="modelValue">
      <template #logo>
        <app-tool-back/>
        <span>圆桌派</span>
      </template>
      <t-menu-item value="/role">角色管理</t-menu-item>
      <t-submenu title="讨论组">
        <t-menu-item v-for="group in groups" :key="group.id" :value="`/group/${group.id}`">{{ group.name }}
        </t-menu-item>
      </t-submenu>
      <t-submenu title="临时会议">
        <t-menu-item v-for="meeting in meetings" :key="meeting.id" :value="`/meeting/0/${meeting.id}`">
          {{ meeting.topic }}
        </t-menu-item>
      </t-submenu>
    </t-menu>
  </div>
</template>
<script lang="ts" setup>
import type {AiRtGroup, AiRtMeeting} from "@/entity/app/ai/roundtable";
import {listAiRtGroupService, listAiRtMeetingService} from "@/services/app/roundtable";

const modelValue = defineModel({
  type: String
});

const groups = ref<Array<AiRtGroup>>([]);
const meetings = ref<Array<AiRtMeeting>>([]);

tryOnMounted(async () => {
  groups.value = await listAiRtGroupService();
  meetings.value = await listAiRtMeetingService("");
})
</script>
<style scoped lang="less">
.roundtable-aside {
}
</style>
