<template>
  <div class="p-8px">
    <t-card>
      <t-form :data="aiSetting">
        <t-form-item label="模型服务地址" label-align="top">
          <t-input v-model="aiSetting.url" placeholder="请输入模型服务地址"/>
        </t-form-item>
        <t-form-item label="模型服务密钥" label-align="top">
          <t-input v-model="aiSetting.key" placeholder="请输入模型服务密钥" type="password" />
        </t-form-item>
        <t-form-item label="模型" label-align="top">
          <div class="flex gap-8px w-full">
            <t-transfer v-model="aiSetting.model" :data="aiSetting.models" :search="true"/>
            <t-button variant="outline" theme="primary" :disabled="!aiSetting.url || !aiSetting.key"
                      @click="handleRefresh">
              <template #icon>
                <refresh-icon/>
              </template>
              刷新
            </t-button>
          </div>
        </t-form-item>
      </t-form>
    </t-card>
  </div>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {OpenAI} from 'openai';
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {RefreshIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";

const {aiSetting} = storeToRefs(useSettingStore());
const loading = ref(false);

const handleRefresh = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    aiSetting.value.models = [];
    const client = new OpenAI({
      baseURL: aiSetting.value.url,
      apiKey: aiSetting.value.key,
      timeout: aiSetting.value.timeout,
      dangerouslyAllowBrowser: true
    });
    const models = await client.models.list({})
    models.data.forEach(model => {
      aiSetting.value.models.push({
        ...model,
        label: model.id,
        value: model.id,
      });
    })
    MessageUtil.success("刷新成功");
  } catch (e) {
    MessageUtil.error("刷新失败", e);
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped lang="less">

</style>
