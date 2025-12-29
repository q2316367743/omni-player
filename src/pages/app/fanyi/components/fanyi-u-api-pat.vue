<template>
  <div class="fanyi-u-api">
    <t-card :bordered="false">
      <template #title>
        <span>AI 智能翻译</span>
        <div
          class="relative inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full overflow-hidden flex-shrink-0 w-fit max-w-fit ml-8px"
          style="background: linear-gradient(145deg, rgb(40, 40, 40), rgb(24, 24, 24)); border: 1px solid rgb(68, 68, 68); color: rgb(228, 199, 143); text-shadow: rgba(0, 0, 0, 0.5) 0px 1px 2px;">
          <div class="absolute top-0 left-[-100%] w-full h-full"
               style="background: linear-gradient(to right, transparent, rgba(255, 215, 0, 0.3), transparent); transform: translateX(28.24%);"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               class="lucide lucide-crown w-3.5 h-3.5 flex-shrink-0">
            <path
              d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
            <path d="M5 21h14"></path>
          </svg>
          <span class="whitespace-nowrap">限时免费</span></div>
      </template>
      <template #actions>
        <t-link theme="primary" href="https://uapis.cn/docs/api-reference/post-ai-translate" target="_blank">官网
        </t-link>
      </template>
      <div class="content">
        <t-card class="input-card" title="翻译设置" bordered>
          <t-form label-align="left">
            <t-form-item label="源语言">
              <t-select v-model="sourceLang" placeholder="自动检测" clearable>
                <t-option v-for="lang in languages" :key="lang.code" :value="lang.code" :label="lang.name"/>
              </t-select>
            </t-form-item>

            <t-form-item label="目标语言">
              <t-select v-model="targetLang" placeholder="请选择目标语言">
                <t-option v-for="lang in languages" :key="lang.code" :value="lang.code" :label="lang.name"/>
              </t-select>
            </t-form-item>

            <t-form-item label="翻译风格">
              <t-select v-model="style">
                <t-option value="professional" label="专业商务（默认）"/>
                <t-option value="casual" label="随意口语化"/>
                <t-option value="academic" label="学术正式"/>
                <t-option value="literary" label="文学艺术"/>
              </t-select>
            </t-form-item>

            <t-form-item label="上下文场景">
              <t-select v-model="context">
                <t-option value="general" label="通用（默认）"/>
                <t-option value="business" label="商务"/>
                <t-option value="technical" label="技术"/>
                <t-option value="medical" label="医疗"/>
                <t-option value="legal" label="法律"/>
                <t-option value="marketing" label="市场营销"/>
                <t-option value="entertainment" label="娱乐"/>
                <t-option value="education" label="教育"/>
                <t-option value="news" label="新闻"/>
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
              <t-space direction="vertical" size="small">
                <t-checkbox v-model="preserveFormat">保留原文格式</t-checkbox>
                <t-checkbox v-model="fastMode">快速模式（约800ms，准确率95%+）</t-checkbox>
              </t-space>
            </t-form-item>

            <t-form-item>
              <t-button
                theme="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!inputText || !targetLang"
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
                <t-tag v-if="result.data?.detected_lang" theme="primary" variant="light">
                  检测语言: {{ getLanguageName(result.data.detected_lang) }}
                </t-tag>
                <t-tag v-if="result.data?.confidence_score" theme="success" variant="light">
                  置信度: {{ (result.data.confidence_score * 100).toFixed(1) }}%
                </t-tag>
                <t-tag v-if="result.performance" theme="default" variant="light">
                  处理时间: {{ result.performance.processing_time_ms }}ms
                  <span v-if="result.performance.cache_hit" class="cache-hit">（缓存命中）</span>
                </t-tag>
              </t-space>
            </div>

            <div class="text-section">
              <div class="section-title">原文</div>
              <div class="text-box">{{ result.data?.original_text }}</div>
            </div>

            <div class="text-section">
              <div class="section-title">译文</div>
              <div class="text-box translated">{{ result.data?.translated_text }}</div>
            </div>

            <div v-if="result.quality_metrics" class="quality-section">
              <div class="section-title">质量指标</div>
              <t-card bordered size="small">
                <t-space direction="vertical" style="width: 100%">
                  <div class="quality-item">
                    <span class="label">流畅度</span>
                    <t-progress
                      :percentage="result.quality_metrics.fluency_score * 100"
                      :label="`${(result.quality_metrics.fluency_score * 100).toFixed(1)}%`"
                      size="small"
                    />
                  </div>
                  <div class="quality-item">
                    <span class="label">准确度</span>
                    <t-progress
                      :percentage="result.quality_metrics.accuracy_score * 100"
                      :label="`${(result.quality_metrics.accuracy_score * 100).toFixed(1)}%`"
                      size="small"
                    />
                  </div>
                  <div class="quality-item">
                    <span class="label">完整度</span>
                    <t-progress
                      :percentage="result.quality_metrics.completeness_score * 100"
                      :label="`${(result.quality_metrics.completeness_score * 100).toFixed(1)}%`"
                      size="small"
                    />
                  </div>
                  <div class="quality-item total">
                    <span class="label">总分</span>
                    <t-progress
                      :percentage="result.quality_metrics.total_score * 100"
                      :label="`${(result.quality_metrics.total_score * 100).toFixed(1)}%`"
                      size="medium"
                    />
                  </div>
                </t-space>
              </t-card>
            </div>
          </div>
        </t-card>
      </div>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {postAction} from '@/lib/http'
import LoadingResult from '@/components/Result/LoadingResult.vue'
import {LocalName} from "@/global/LocalName.ts";

type TranslateStyle = 'casual' | 'professional' | 'academic' | 'literary'
type TranslateContext =
  'general'
  | 'business'
  | 'technical'
  | 'medical'
  | 'legal'
  | 'marketing'
  | 'entertainment'
  | 'education'
  | 'news'

interface TranslateRequest {
  text?: string
  texts?: string[]
  source_lang?: string
  style?: TranslateStyle
  context?: TranslateContext
  preserve_format?: boolean
  fast_mode?: boolean
  max_concurrency?: number
}

interface KeyPhrase {
  phrase: string
  translation: string
}

interface Explanation {
  key_phrases: KeyPhrase[]
  cultural_notes: string[]
  grammar_notes: string[]
}

interface TranslateData {
  original_text: string
  translated_text: string
  detected_lang: string
  confidence_score: number
  alternatives: string[]
  explanation: Explanation
}

interface BatchTranslateItem {
  original_text: string
  translated_text: string
  confidence_score: number
}

interface BatchSummary {
  total_items: number
  success_items: number
  failed_items: number
  average_quality: number
}

interface QualityMetrics {
  fluency_score: number
  accuracy_score: number
  completeness_score: number
  total_score: number
}

interface Performance {
  processing_time_ms: number
  cache_hit: boolean
}

interface TranslateResponse {
  code: number
  message: string
  is_batch: boolean
  data?: TranslateData
  batch_data?: BatchTranslateItem[]
  batch_summary?: BatchSummary
  performance: Performance
  quality_metrics?: QualityMetrics
  error?: string
}

interface Language {
  code: string
  name: string
}

const languages: Language[] = [
  {code: 'en', name: '英语'},
  {code: 'zh', name: '中文'},
  {code: 'ja', name: '日语'},
  {code: 'ko', name: '韩语'},
  {code: 'fr', name: '法语'},
  {code: 'de', name: '德语'},
  {code: 'es', name: '西班牙语'},
  {code: 'ru', name: '俄语'},
  {code: 'it', name: '意大利语'},
  {code: 'pt', name: '葡萄牙语'},
  {code: 'ar', name: '阿拉伯语'},
  {code: 'hi', name: '印地语'}
]

const inputText = ref('')
const sourceLang = useLocalStorage(LocalName.PAGE_APP_FAN_YI_UAPIS_PAT_SOURCE_LANG, '')
const targetLang = useLocalStorage(LocalName.PAGE_APP_FAN_YI_UAPIS_PAT_TARGET_LANG, 'zh')
const style = ref<TranslateStyle>('professional')
const context = ref<TranslateContext>('general')
const preserveFormat = ref(false)
const fastMode = useLocalStorage(LocalName.PAGE_APP_FAN_YI_UAPIS_PAT_FAST_MODE, false)
const loading = ref(false)
const result = ref<TranslateResponse | null>(null)
const error = ref('')

async function handleTranslate() {
  if (!inputText.value.trim() || !targetLang.value) {
    error.value = '请输入待翻译文本并选择目标语言'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const requestData: TranslateRequest = {
      text: inputText.value
    }

    if (sourceLang.value) {
      requestData.source_lang = sourceLang.value
    }

    if (style.value !== 'professional') {
      requestData.style = style.value
    }

    if (context.value !== 'general') {
      requestData.context = context.value
    }

    if (preserveFormat.value) {
      requestData.preserve_format = true
    }

    if (fastMode.value) {
      requestData.fast_mode = true
    }

    const response = await postAction<TranslateResponse>(
      'https://uapis.cn/api/v1/ai/translate',
      requestData,
      {
        params: {
          target_lang: targetLang.value
        }
      }
    )

    result.value = response.data

    if (response.data.code !== 200) {
      error.value = response.data.message || '翻译失败'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '翻译请求失败'
  } finally {
    loading.value = false
  }
}

function getLanguageName(code: string): string {
  const lang = languages.find(l => l.code === code)
  return lang ? lang.name : code
}
</script>

<style scoped lang="less">
.fanyi-u-api {
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

      .cache-hit {
        color: var(--td-success-color-6);
        margin-left: 4px;
      }
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

    .quality-section {
      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--td-text-color-secondary);
        margin-bottom: 12px;
      }

      .quality-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
          width: 60px;
          font-size: 13px;
          color: var(--td-text-color-secondary);
        }

        &.total {
          .label {
            font-weight: 500;
            color: var(--td-text-color-primary);
          }
        }
      }
    }
  }
}
</style>
