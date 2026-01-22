<template>
  <div class="my-chat-sender-wrapper">
    <div class="chat-sender">
      <div class="chat-sender-input">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          class="chat-textarea"
          :placeholder="placeholder"
          :disabled="disabled"
          rows="1"
          @input="handleInput"
        />
      </div>
      <div class="chat-sender-footer">
        <div class="chat-sender-footer-left">
          <slot name="footer-prefix">
            <div class="flex items-center">
              <home-assistant-select v-if="showModelSelect" v-model="currentModel"/>
              <div v-if="showThink && supportThink">
                <t-button :theme="currentThink ? 'primary' : 'default'" variant="outline" shape="round"
                          @click="currentThink = !currentThink">
                  <template #icon>
                    <chart-ring1-icon/>
                  </template>
                  深度思考
                </t-button>
              </div>
            </div>
          </slot>
        </div>
        <div class="chat-sender-footer-right">
          <slot name="suffix">
            <t-button v-if="showStop" theme="danger" shape="circle" @click="handleStop">
              <template #icon>
                <stop-circle-icon/>
              </template>
            </t-button>
            <t-space v-else size="small">
              <t-button v-if="showClear" variant="outline" shape="round" :disabled="isDisabled" @click="handleClear">
                <template #icon>
                  <delete-icon/>
                </template>
                清空输入
              </t-button>
              <t-button shape="round" :disabled="isDisabled" @click="handleSend">发送</t-button>
            </t-space>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DeleteIcon, StopCircleIcon, ChartRing1Icon} from "tdesign-icons-vue-next";
import HomeAssistantSelect from "@/pages/app/ai/chat/components/HomeAssistantSelect.vue";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

const props = withDefaults(defineProps<{
  modelValue?: string
  model?: string
  think?: boolean
  placeholder?: string
  disabled?: boolean
  showStop?: boolean
  showClear?: boolean
  showModelSelect?: boolean
  showThink?: boolean
}>(), {
  modelValue: '',
  model: '',
  think: true,
  placeholder: '请输入消息...',
  disabled: false,
  showStop: false,
  showClear: true,
  showModelSelect: true,
  showThink: true
});

const emit = defineEmits(['update:modelValue', 'update:model', 'update:think', 'send', 'stop', 'clear']);

const textareaRef = ref<HTMLTextAreaElement>();

const inputText = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
});

const currentModel = computed({
  get: () => props.model || useSettingStore().aiSetting.defaultChatModel,
  set: val => emit('update:model', val)
});

const currentThink = computed({
  get: () => props.think,
  set: val => emit('update:think', val)
});

const isDisabled = computed(() => inputText.value.trim() === '');

const supportThink = computed(() => useSettingStore().supportThink(currentModel.value));

const autoResize = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = newHeight + 'px';
  }
};

const handleInput = () => {
  autoResize();
};
//
// const handleKeydown = (e: KeyboardEvent) => {
//   if (e.key === 'Enter' && !e.shiftKey) {
//     e.preventDefault();
//     handleSend();
//   }
// };

const handleClear = () => {
  inputText.value = '';
  emit('clear');
  nextTick(() => {
    autoResize();
  });
};

const handleSend = () => {
  if (isDisabled.value) {
    return;
  }
  emit('send', inputText.value);
  inputText.value = '';
  nextTick(() => {
    autoResize();
  });
};

const handleStop = () => {
  emit('stop');
};

onMounted(() => {
  nextTick(() => {
    autoResize();
  });
});

watch(inputText, () => {
  nextTick(() => {
    autoResize();
  });
});
</script>
<style scoped lang="less">
.my-chat-sender-wrapper {
  width: 100%;

  .chat-sender {
    width: calc(100% - 24px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background-color: var(--td-bg-color-container);
    border-radius: 16px;
    border: 1px solid var(--td-component-border);

    .chat-sender-input {
      display: flex;
      flex-direction: column;

      .chat-textarea {
        width: calc(100% - 24px);
        min-height: 40px;
        max-height: 200px;
        padding: 8px 12px;
        border: 1px solid var(--td-component-border);
        border-radius: 16px;
        background-color: var(--td-bg-color-container);
        color: var(--td-text-color-primary);
        font-size: 14px;
        line-height: 1.5;
        resize: none;
        outline: none;
        transition: border-color 0.2s;
        font-family: inherit;

        &::placeholder {
          color: var(--td-text-color-placeholder);
        }

        &:focus {
          border-color: var(--td-brand-color);
        }

        &:disabled {
          background-color: var(--td-bg-color-page);
          cursor: not-allowed;
        }
      }
    }

    .chat-sender-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;

      .chat-sender-footer-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .chat-sender-footer-right {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
