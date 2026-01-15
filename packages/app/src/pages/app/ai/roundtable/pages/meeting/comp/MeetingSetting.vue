<template>
  <div class="m-16px">
    <t-form>
      <t-form-item label-align="top" label="最大发言轮数" help="0 表示无限制">
        <t-input-number v-model="data.max_rounds" :min="0" placeholder="0 表示无限制"/>
      </t-form-item>
      <t-form-item label-align="top" label="总结间隔" help="每 N 轮后触发上帝AI总结">
        <t-input-number v-model="data.summary_interval" :min="1" placeholder="每 N 轮后总结"/>
      </t-form-item>
      <t-form-item label-align="top" label="自动总结" help="会议结束时是否自动触发最终总结">
        <t-switch v-model="data.auto_summary_on_end" :custom-value="[0, 1]"/>
      </t-form-item>
      <t-form-item label-align="top">
        <t-space>
          <t-button theme="primary" @click="handleSave">保存</t-button>
          <t-button theme="danger" @click="handleEndMeeting">终止会议</t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </div>
</template>
<script lang="ts" setup>
import type {AiRtMeeting} from "@/entity/app/ai/roundtable";
import {cloneDeep} from "es-toolkit";
import {updateAiRtMeetingService} from "@/services/app/roundtable";
import MessageUtil from "@/util/model/MessageUtil.ts";

const props = defineProps({
  meeting: {
    type: Object as PropType<AiRtMeeting>,
    required: true
  }
});
const data = ref<AiRtMeeting>(cloneDeep(props.meeting));
const emit = defineEmits(['change']);

const handleSave = async () => {
  await updateAiRtMeetingService(props.meeting.id, data.value)
  emit('change');
  MessageUtil.success("已更新");
}

const handleEndMeeting = async () => {
  await updateAiRtMeetingService(props.meeting.id, {status: 'ended'})
  emit('change');
  MessageUtil.success("会议已终止");
}
</script>
<style scoped lang="less">

</style>
