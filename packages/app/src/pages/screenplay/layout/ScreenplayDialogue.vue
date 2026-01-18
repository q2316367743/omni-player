<template>
  <div class="screenplay-dialogue-container">
    <div class="layout-toggle">
      <t-radio-group v-model="layoutMode" variant="default-filled" size="small">
        <t-radio-button value="chat">聊天</t-radio-button>
        <t-radio-button value="novel">小说</t-radio-button>
      </t-radio-group>
    </div>
    <div class="chat-messages" ref="chatMessagesRef" :class="`layout-${layoutMode}`">
      <div
        v-for="dialogue in dialogues"
        :key="dialogue.id"
        :class="['message-item', `message-${dialogue.type}`]"
      >
        <div v-if="dialogue.type === 'role'" class="message-role">
          <div v-if="layoutMode === 'chat'" class="message-avatar">
            {{ getRoleName(dialogue.role_id)?.charAt(0) }}
          </div>
          <div class="message-content">
            <div v-if="layoutMode === 'chat'" class="message-sender">{{ getRoleName(dialogue.role_id) }}</div>
            <div v-if="dialogue.action" class="message-action">{{ dialogue.action }}</div>
            <div class="message-card">
              <span v-if="layoutMode === 'novel'" class="novel-role-name">{{ getRoleName(dialogue.role_id) }}：</span>{{ dialogue.dialogue }}
            </div>
          </div>
        </div>
        <div v-else-if="dialogue.type === 'narrator'" class="message-narrator">
          <div v-if="layoutMode === 'chat'" class="narrator-icon">📖</div>
          <div class="message-content">
            <div v-if="layoutMode === 'chat'" class="message-sender">叙述者</div>
            <div v-if="dialogue.action" class="message-action">{{ dialogue.action }}</div>
            <div class="message-card narrator-card">
              {{ dialogue.dialogue }}
            </div>
          </div>
        </div>
        <div v-else-if="dialogue.type === 'event'" class="message-event">
          <div v-if="layoutMode === 'chat'" class="event-icon">⚡</div>
          <div class="message-content">
            <div v-if="layoutMode === 'chat'" class="message-sender">突发事件</div>
            <div class="message-card event-card">
              <span v-if="layoutMode === 'novel'" class="novel-role-name">突发事件：</span>{{ dialogue.dialogue }}
            </div>
          </div>
        </div>
        <div v-else-if="dialogue.type === 'system'" class="message-system">
          <t-tag theme="default" size="small" variant="outline">{{ dialogue.dialogue }}</t-tag>
        </div>
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
const layoutMode = ref<'chat' | 'novel'>('chat')

const getRoleName = (roleId: string) => {
  return roleId ? props.roleMap.get(roleId)?.name : '';
};
</script>
<style scoped lang="less">
@import "less/ScreenplayDialogue.less";
</style>
