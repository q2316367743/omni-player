<template>
  <div class="fanyi-pear-api">
    <t-card :bordered="false">
      <template #title>
        <span>AI 翻译</span>
      </template>
      <template #actions>
        <t-link theme="primary" href="https://api.pearktrue.cn/dashboard/detail?id=303" target="_blank">官网</t-link>
      </template>
      <div class="content">
        <t-card class="input-card" title="翻译设置" bordered>
          <t-form label-align="left">
            <t-form-item label="源语言">
              <t-select v-model="sourceLang" placeholder="自动检测">
                <t-option v-for="item in languages" :key="item.value" :value="item.value" :label="item.label"/>
              </t-select>
            </t-form-item>

            <t-form-item label="目标语言">
              <t-select v-model="targetLang" placeholder="请选择目标语言">
                <t-option v-for="item in languages" :key="item.value" :value="item.value" :label="item.label"/>
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
                <t-tag v-if="result.quality" theme="success" variant="light">
                  质量: {{ result.quality }}
                </t-tag>
              </t-space>
            </div>

            <div class="text-section">
              <div class="section-title">原文 ({{ getLanguageLabel(result.source_lang) }})</div>
              <div class="text-box">{{ inputText }}</div>
            </div>

            <div class="text-section">
              <div class="section-title">译文 ({{ getLanguageLabel(result.target_lang) }})</div>
              <div class="text-box translated">{{ result.data }}</div>
            </div>
          </div>
        </t-card>
      </div>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import {getAction} from '@/lib/http'
import LoadingResult from '@/components/Result/LoadingResult.vue'
import {LocalName} from "@/global/LocalName.ts"

interface TranslateResponse {
  code: number
  msg: string
  data: string
  id: string
  quality: string
  source_lang: string
  target_lang: string
  api_source: string
}

interface Language {
  value: string
  label: string
}

const languages: Language[] = [
  {value: 'auto', label: '自动检测'},
  {value: 'zh', label: '中文'},
  {value: 'en', label: '英语'},
  {value: 'ja', label: '日语'},
  {value: 'ko', label: '韩语'},
  {value: 'fr', label: '法语'},
  {value: 'de', label: '德语'},
  {value: 'es', label: '西班牙语'},
  {value: 'ru', label: '俄语'},
  {value: 'pt', label: '葡萄牙语'},
  {value: 'it', label: '意大利语'}
]

const inputText = ref('')
const sourceLang = useLocalStorage(LocalName.PAGE_APP_FAN_YI_PEAR_API_303_SOURCE_LANG, 'auto')
const targetLang = useLocalStorage(LocalName.PAGE_APP_FAN_YI_PEAR_API_303_TARGET_LANG, 'zh')
const loading = ref(false)
const result = ref<TranslateResponse | null>(null)
const error = ref('')

function getLanguageLabel(langCode: string): string {
  const lang = languages.find(item => item.value === langCode)
  return lang ? lang.label : langCode
}

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
      'https://api.pearktrue.cn/api/translate/ai/',
      {
        text: inputText.value,
        source_lang: sourceLang.value,
        target_lang: targetLang.value
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
