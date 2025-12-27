<template>
  <div class="fanyi-pear-api">
    <t-card bordered>
      <template #title>
        <span>万能翻译</span>
      </template>
      <template #actions>
        <t-link theme="primary" href="https://api.pearktrue.cn/dashboard/detail?id=13" target="_blank">官网</t-link>
      </template>
      <div class="content">
        <t-card class="input-card" title="翻译设置" bordered>
          <t-form label-align="left">
            <t-form-item label="翻译方向">
              <t-select v-model="translateType" placeholder="自动检测">
                <t-option v-for="item in translateTypes" :key="item.value" :value="item.value" :label="item.label"/>
              </t-select>
            </t-form-item>

            <t-form-item label="待翻译文本">
              <t-textarea
                v-model="inputText"
                placeholder="请输入要翻译的文本..."
                :autosize="{ minRows: 6, maxRows: 12 }"
                :maxlength="10000"
                allow-input-over-max
              />
            </t-form-item>

            <t-form-item>
              <t-button
                theme="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!inputText"
                @click="handleTranslate"
              >
                {{ loading ? '翻译中...' : '开始翻译' }}
              </t-button>
            </t-form-item>
          </t-form>
        </t-card>

        <t-card class="output-card" title="翻译结果" bordered>
          <LoadingResult v-if="loading" title="翻译中" tip="正在处理您的翻译请求，请稍候..."/>
          <t-empty v-else-if="!result && !error" description="请输入文本并开始翻译"/>

          <div v-if="error" class="error-section">
            <t-alert theme="error" :message="error"/>
          </div>

          <div v-if="result" class="result-content">
            <div class="meta-info">
              <t-space size="small">
                <t-tag v-if="result.api_source" theme="primary" variant="light">
                  API来源: PearAPI
                </t-tag>
              </t-space>
            </div>

            <div class="text-section">
              <div class="section-title">原文</div>
              <div class="text-box">{{ result.data?.text }}</div>
            </div>

            <div class="text-section">
              <div class="section-title">译文</div>
              <div class="text-box translated">{{ result.data?.translate }}</div>
            </div>
          </div>
        </t-card>
      </div>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {getAction} from '@/lib/http'
import LoadingResult from '@/components/Result/LoadingResult.vue'
import {LocalName} from "@/global/LocalName.ts"

interface TranslateData {
  text: string
  translate: string
}

interface TranslateResponse {
  code: number
  msg: string
  data: TranslateData
  api_source: string
}

interface TranslateType {
  value: string
  label: string
}

const translateTypes: TranslateType[] = [
  {value: 'AUTO', label: '自动检测（默认）'},
  {value: 'ZH_CN2EN', label: '中文 → 英文'},
  {value: 'ZH_CN2JA', label: '中文 → 日语'},
  {value: 'ZH_CN2KR', label: '中文 → 韩语'},
  {value: 'ZH_CN2FR', label: '中文 → 法语'},
  {value: 'ZH_CN2RU', label: '中文 → 俄语'},
  {value: 'ZH_CN2SP', label: '中文 → 西班牙语'},
  {value: 'EN2ZH_CN', label: '英文 → 中文'},
  {value: 'JA2ZH_CN', label: '日语 → 中文'},
  {value: 'KR2ZH_CN', label: '韩语 → 中文'},
  {value: 'FR2ZH_CN', label: '法语 → 中文'},
  {value: 'RU2ZH_CN', label: '俄语 → 中文'},
  {value: 'SP2ZH_CN', label: '西班牙语 → 中文'}
]

const inputText = ref('')
const translateType = useLocalStorage(LocalName.PAGE_APP_FAN_YI_PEAR_API_13_TYPE, 'AUTO')
const loading = ref(false)
const result = ref<TranslateResponse | null>(null)
const error = ref('')

async function handleTranslate() {
  if (!inputText.value.trim()) {
    error.value = '请输入待翻译文本'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await getAction<TranslateResponse>(
      'https://api.pearktrue.cn/api/translate/',
      {
        text: inputText.value,
        type: translateType.value
      }
    )

    result.value = response.data

    if (response.data.code !== 200) {
      error.value = response.data.msg || '翻译失败'
    }
  } catch (err: any) {
    error.value = err.response?.data?.msg || err.message || '翻译请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.fanyi-pear-api {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  }

  .input-card,
  .output-card {
    height: fit-content;

    :deep(.result-container) {
      min-height: 300px;
    }
  }

  .char-count {
    text-align: right;
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin-top: 4px;
  }

  .error-section {
    margin-bottom: 16px;
  }

  .result-content {
    .meta-info {
      margin-bottom: 20px;
    }

    .text-section {
      margin-bottom: 20px;

      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--td-text-color-secondary);
        margin-bottom: 8px;
      }

      .text-box {
        padding: 12px;
        background: var(--td-bg-color-container);
        border: 1px solid var(--td-component-border);
        border-radius: var(--td-radius-default);
        line-height: 1.6;
        color: var(--td-text-color-primary);
        min-height: 60px;
        white-space: pre-wrap;
        word-wrap: break-word;

        &.translated {
          background: var(--td-success-color-1);
          border-color: var(--td-success-color-3);
        }
      }
    }
  }
}
</style>
