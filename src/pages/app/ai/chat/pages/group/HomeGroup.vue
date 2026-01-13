<template>
  <div class="home-group">
    <div class="home-group__header">
      <t-button theme="primary" variant="text" shape="square" @click="toggleCollapsed()" v-if="collapsed">
        <template #icon>
          <menu-fold-icon/>
        </template>
      </t-button>
    </div>
    <div class="home-group__content">
      <home-group-content :group-id="groupId"/>
    </div>
    <div class="home-group__footer">
      <chat-sender
        v-model="text"
        class="chat-sender"
        :textarea-props="{placeholder: '在这里提问，新建对话'}"
        @send="inputEnter"
      >
        <template #suffix>
          <t-space size="small">
            <t-button variant="outline" shape="round" :disabled @click="onClear">
              <template #icon>
                <delete-icon/>
              </template>
              清空输入
            </t-button>
            <t-button shape="round" :disabled @click="onSend">发送</t-button>
          </t-space>
        </template>
        <template #prefix>
          <home-assistant-select v-model="model"/>
        </template>
      </chat-sender>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DeleteIcon, MenuFoldIcon} from "tdesign-icons-vue-next";
import {ChatSender} from "@tdesign-vue-next/chat";
import MessageUtil from "@/util/model/MessageUtil";
import {activeKey, collapsed, renderGroup, toggleCollapsed} from "@/pages/app/ai/chat/model";
import HomeGroupContent from "@/pages/app/ai/chat/pages/group/HomeGroupContent.vue";
import HomeAssistantSelect from "@/pages/app/ai/chat/components/HomeAssistantSelect.vue";
import {createAiChatItemService, getAiChatGroupService} from "@/services/app/chat";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

const groupId = renderGroup(activeKey.value);

const text = ref('');
const model = ref(useSettingStore().aiSetting.defaultChatModel);

const disabled = computed(() => text.value.trim() === '');

const onClear = () => text.value = '';
const onSend = () => {
  if (disabled.value) {
    return;
  }
  inputEnter(text.value);
  text.value = '';
};
// 模拟消息发送
const inputEnter = (inputValue: string) => {
  // 添加到列表中
  createAiChatItemService(groupId, inputValue, model.value)
    .then(id => activeKey.value = `/home/chat/${groupId}/${id}?mode=create`)
    .catch(e => MessageUtil.error("提问失败", e));
};

onMounted(async () => {
  const group = await getAiChatGroupService(groupId);
  if (group) {
    // 尝试获取分组的模型
    model.value = group.model || model.value;
  }
})
</script>
<style scoped lang="less">
.home-group {
  padding: 4px 8px 4px 4px;
  width: calc(100% - 12px);
  height: calc(100% - 8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &__header {
    width: 100%;
    flex: 0 0 32px;
  }

  &__content {
    width: 100%;
    flex: 1 1 auto;
    overflow: auto;
  }

  &__footer {
    width: 100%;
    max-width: 800px;
    margin: 0 auto 4px;
  }
}
</style>
