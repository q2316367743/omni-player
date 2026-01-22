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
      <home-group-content :group-id="groupId" @refresh-group="onRefreshGroup"/>
    </div>
    <div class="home-group__footer">
      <chat-sender
        v-model="text"
        :model="model"
        :think="think"
        placeholder="在这里提问，新建对话"
        @send="inputEnter"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {MenuFoldIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil";
import {activeKey, collapsed, renderGroup, toggleCollapsed} from "@/pages/app/ai/chat/model";
import HomeGroupContent from "@/pages/app/ai/chat/pages/group/HomeGroupContent.vue";
import {createAiChatItemService, getAiChatGroupService} from "@/services/app/chat";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

const emit = defineEmits(["refreshGroup"]);

const groupId = renderGroup(activeKey.value);

const text = ref('');
const model = ref(useSettingStore().aiSetting.defaultChatModel);
const think = ref(true);

const inputEnter = (inputValue: string) => {
  createAiChatItemService(groupId, inputValue, model.value, think.value)
    .then(id => activeKey.value = `/home/chat/${groupId}/${id}?mode=create`)
    .catch(e => MessageUtil.error("提问失败", e));
};

const onRefreshGroup = () => {
  emit("refreshGroup");
};

onMounted(async () => {
  const group = await getAiChatGroupService(groupId);
  if (group) {
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
