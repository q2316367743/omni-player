<template>
  <div class="p-8px overflow-auto" style="height: calc(100% - 40px)">
    <t-card>
      <t-form :data="aiSetting">
        <t-form-item label="AI 类型" label-align="top">
          <t-radio-group v-model="aiSetting.type">
            <t-radio value="openai">openai</t-radio>
            <t-radio value="ollama">ollama</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="模型服务地址" label-align="top">
          <t-input v-model="aiSetting.url" placeholder="请输入模型服务地址"/>
        </t-form-item>
        <t-form-item label="模型服务密钥" label-align="top">
          <t-input v-model="aiSetting.key" placeholder="请输入模型服务密钥" type="password"/>
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
        <t-form-item label="支持深度思考的模型" label-align="top">
          <t-select v-model="aiSetting.thinks" multiple :options="thinkOptions"/>
        </t-form-item>
        <t-form-item label="默认聊天模型" label-align="top">
          <t-select v-model="aiSetting.defaultChatModel" :options="modelOptions"/>
        </t-form-item>
        <t-form-item label="默认话题命名模型" label-align="top">
          <t-select v-model="aiSetting.defaultTopicModel" :options="modelOptions"/>
        </t-form-item>
        <t-form-item label="搜索词构建模型" label-align="top">
          <t-select v-model="aiSetting.defaultSearchModel" :options="modelOptions"/>
        </t-form-item>
        <t-divider align="left">memo 相关配置</t-divider>
        <t-form-item label="memo 分析模型" label-align="top">
          <t-select v-model="aiSetting.memoAnalyzerModel" :options="modelOptions"/>
        </t-form-item>
        <t-form-item label="文本向量化模型" label-align="top" help="仅支持 1536 维的向量模型">
          <t-select v-model="aiSetting.memoEmbeddingModel" :options="modelOptions"/>
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
import {getTauriFetch} from "@/lib/http.ts";

const {aiSetting, modelOptions} = storeToRefs(useSettingStore());
const loading = ref(false);

const thinkOptions = computed(() => aiSetting.value.model?.map(e => ({label: e, value: e})) || []);

watch(() => aiSetting.value.model, val => {
  // 删除不存在的模型
  aiSetting.value.thinks = aiSetting.value.thinks.filter(e => val.includes(e));
})

const handleRefresh = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    aiSetting.value.models = [];
    const client = new OpenAI({
      baseURL: aiSetting.value.url,
      apiKey: aiSetting.value.key,
      timeout: aiSetting.value.timeout,
      dangerouslyAllowBrowser: true,
      fetch: getTauriFetch()
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
