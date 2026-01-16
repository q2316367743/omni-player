<template>
  <div class="chat-messages" ref="chatMessagesRef">
    <div
      v-for="dialogue in dialogues"
      :key="dialogue.id"
      :class="['message-item', `message-${dialogue.type}`]"
    >
      <div v-if="dialogue.type === 'role'" class="message-role">
        <div class="message-avatar">
          {{ getRoleName(dialogue.role_id)?.charAt(0) }}
        </div>
        <div class="message-content">
          <div class="message-sender">{{ getRoleName(dialogue.role_id) }}</div>
          <div v-if="dialogue.action" class="message-action">{{ dialogue.action }}</div>
          <t-card :bordered="false" class="message-card">
            {{ dialogue.dialogue }}
          </t-card>
        </div>
      </div>
      <div v-else-if="dialogue.type === 'narrator'" class="message-narrator">
        <div class="narrator-icon">📖</div>
        <div class="message-content">
          <div class="message-sender">叙述者</div>
          <div v-if="dialogue.action" class="message-action">{{ dialogue.action }}</div>
          <t-card :bordered="false"  variant="light" class="message-card">
            {{ dialogue.dialogue }}
          </t-card>
        </div>
      </div>
      <div v-else-if="dialogue.type === 'event'" class="message-event">
        <div class="event-icon">⚡</div>
        <div class="message-content">
          <div class="message-sender">突发事件</div>
          <t-card :bordered="false"  variant="light" class="message-card">
            {{ dialogue.dialogue }}
          </t-card>
        </div>
      </div>
      <div v-else-if="dialogue.type === 'system'" class="message-system">
        <t-tag theme="default" size="small" variant="outline">{{ dialogue.dialogue }}</t-tag>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {SpDialogue, SpRole} from "@/entity/screenplay";
import {ref} from "vue";

const props = defineProps({
  dialogues: {
    type: Array as PropType<Array<SpDialogue>>,
    required: true
  },
  roleMap: {
    type: Object as PropType<Map<string, SpRole>>,
    required: true
  }
});

const chatMessagesRef = ref<HTMLElement>()

const getRoleName = (roleId: string) => {
  return roleId ? props.roleMap.get(roleId)?.name : '';
};
</script>
<style scoped lang="less">
@import "less/ScreenplayDialogue.less";
</style>
