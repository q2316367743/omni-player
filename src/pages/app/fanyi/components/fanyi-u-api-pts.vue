<template>
  <div class="fanyi-u-api-stream">
    <t-card bordered>
      <template #title>
        <span>流式翻译（实时打字效果）</span>
        <div
          class="relative inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full overflow-hidden flex-shrink-0 w-fit max-w-fit ml-8px"
          style="background: linear-gradient(145deg, rgb(40, 40, 40), rgb(24, 24, 24)); border: 1px solid rgb(68, 68, 68); color: rgb(228, 199, 143); text-shadow: rgba(0, 0, 0, 0.5) 0px 1px 2px;">
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
        <t-link theme="primary" href="https://uapis.cn/docs/api-reference/post-translate-stream" target="_blank">官网
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

            <t-form-item label="语气">
              <t-select v-model="tone">
                <t-option value="" label="默认"/>
                <t-option value="formal" label="正式"/>
                <t-option value="casual" label="随意"/>
                <t-option value="polite" label="礼貌"/>
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
              <t-space direction="horizontal" size="small">
                <t-button
                  theme="primary"
                  size="large"
                  :loading="loading"
                  :disabled="!inputText || !targetLang"
                  @click="handleTranslate"
                >
                  {{ loading ? '翻译中...' : '开始翻译' }}
                </t-button>
                <t-button
                  v-if="loading"
                  theme="default"
                  size="large"
                  @click="handleStop"
                >
                  停止
                </t-button>
              </t-space>
            </t-form-item>
          </t-form>
        </t-card>

        <t-card class="output-card" title="翻译结果" bordered>
          <LoadingResult v-if="loading && !translatedText" title="翻译中" tip="正在处理您的翻译请求，请稍候..."/>

          <t-empty v-else-if="!translatedText && !error" description="请输入文本并开始翻译"/>

          <div v-if="error" class="error-section">
            <t-alert theme="error" :message="error"/>
          </div>

          <div v-if="translatedText" class="result-content">
            <div class="meta-info">
              <t-space size="small">
                <t-tag v-if="detectedLang" theme="primary" variant="light">
                  检测语言: {{ getLanguageName(detectedLang) }}
                </t-tag>
                <t-tag v-if="processingTime" theme="default" variant="light">
                  处理时间: {{ processingTime }}ms
                </t-tag>
                <t-tag v-if="isStreaming" theme="success" variant="light">
                  <span class="streaming-dot"></span>
                  实时翻译中
                </t-tag>
              </t-space>
            </div>

            <div class="text-section">
              <div class="section-title">原文</div>
              <div class="text-box">{{ inputText }}</div>
              <div v-if="audioUrls.speak_url" class="audio-player">
                <div class="player-controls">
                  <t-button
                    :theme="currentAudioUrl === audioUrls.speak_url && isPlaying ? 'primary' : 'default'"
                    variant="outline"
                    size="small"
                    @click="currentAudioUrl === audioUrls.speak_url && currentAudio ? togglePlayPause() : playAudio(audioUrls.speak_url)"
                  >
                    <template #icon>
                      <svg v-if="currentAudioUrl === audioUrls.speak_url && isPlaying" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    </template>
                    {{ currentAudioUrl === audioUrls.speak_url && isPlaying ? '暂停' : '播放' }}
                  </t-button>
                  <t-button
                    v-if="currentAudioUrl === audioUrls.speak_url"
                    theme="default"
                    variant="outline"
                    size="small"
                    @click="stopAudio"
                  >
                    <template #icon>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="4" y="4" width="16" height="16"></rect>
                      </svg>
                    </template>
                    停止
                  </t-button>
                </div>
                <div v-if="currentAudioUrl === audioUrls.speak_url && audioDuration > 0" class="progress-section">
                    <span class="time">{{ formatTime((audioProgress / 100) * audioDuration) }}</span>
                    <div class="progress-bar" @click="(e: MouseEvent) => seekAudio((e.offsetX / (e.target as HTMLElement).offsetWidth) * 100)">
                      <div class="progress-fill" :style="{ width: audioProgress + '%' }"></div>
                    </div>
                    <span class="time">{{ formatTime(audioDuration) }}</span>
                  </div>
              </div>
            </div>

            <div class="text-section">
              <div class="section-title">译文</div>
              <div class="text-box translated">
                <span v-if="isStreaming" class="cursor"></span>
                {{ translatedText }}
              </div>
              <div v-if="audioUrls.tSpeak_url" class="audio-player">
                <div class="player-controls">
                  <t-button
                    :theme="currentAudioUrl === audioUrls.tSpeak_url && isPlaying ? 'primary' : 'default'"
                    variant="outline"
                    size="small"
                    @click="currentAudioUrl === audioUrls.tSpeak_url && currentAudio ? togglePlayPause() : playAudio(audioUrls.tSpeak_url)"
                  >
                    <template #icon>
                      <svg v-if="currentAudioUrl === audioUrls.tSpeak_url && isPlaying" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    </template>
                    {{ currentAudioUrl === audioUrls.tSpeak_url && isPlaying ? '暂停' : '播放' }}
                  </t-button>
                  <t-button
                    v-if="currentAudioUrl === audioUrls.tSpeak_url"
                    theme="default"
                    variant="outline"
                    size="small"
                    @click="stopAudio"
                  >
                    <template #icon>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="4" y="4" width="16" height="16"></rect>
                      </svg>
                    </template>
                    停止
                  </t-button>
                </div>
                <div v-if="currentAudioUrl === audioUrls.tSpeak_url && audioDuration > 0" class="progress-section">
                    <span class="time">{{ formatTime((audioProgress / 100) * audioDuration) }}</span>
                    <div class="progress-bar" @click="(e: MouseEvent) => seekAudio((e.offsetX / (e.target as HTMLElement).offsetWidth) * 100)">
                      <div class="progress-fill" :style="{ width: audioProgress + '%' }"></div>
                    </div>
                    <span class="time">{{ formatTime(audioDuration) }}</span>
                  </div>
              </div>
            </div>

            <div v-if="audioUrls.speak_url && Object.keys(audioUrls).length > 2" class="audio-section">
              <div class="section-title">更多语音选项</div>
              <t-card bordered size="small">
                <t-space direction="vertical" style="width: 100%">
                  <div v-for="(url, label) in extraAudioUrls" :key="label" class="audio-item">
                    <span class="label">{{ label }}</span>
                    <t-space size="small">
                      <t-button
                        :theme="currentAudioUrl === url && isPlaying ? 'primary' : 'default'"
                        variant="outline"
                        size="small"
                        @click="currentAudioUrl === url && currentAudio ? togglePlayPause() : playAudio(url)"
                      >
                        <template #icon>
                          <svg v-if="currentAudioUrl === url && isPlaying" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          </svg>
                        </template>
                        {{ currentAudioUrl === url && isPlaying ? '暂停' : '播放' }}
                      </t-button>
                      <t-button
                        v-if="currentAudioUrl === url"
                        theme="default"
                        variant="outline"
                        size="small"
                        @click="stopAudio"
                      >
                        <template #icon>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="4" y="4" width="16" height="16"></rect>
                          </svg>
                        </template>
                        停止
                      </t-button>
                    </t-space>
                  </div>
                </t-space>
              </t-card>
              <div v-if="currentAudioUrl && Object.keys(extraAudioUrls).includes(currentAudioUrl) && audioDuration > 0" class="audio-player">
                <div class="progress-section">
                  <span class="time">{{ formatTime((audioProgress / 100) * audioDuration) }}</span>
                  <div class="progress-bar" @click="(e: MouseEvent) => seekAudio((e.offsetX / (e.target as HTMLElement).offsetWidth) * 100)">
                    <div class="progress-fill" :style="{ width: audioProgress + '%' }"></div>
                  </div>
                  <span class="time">{{ formatTime(audioDuration) }}</span>
                </div>
              </div>
            </div>
          </div>
        </t-card>
      </div>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, onUnmounted} from 'vue'
import LoadingResult from '@/components/Result/LoadingResult.vue'
import {LocalName} from "@/global/LocalName.ts";

interface Language {
  code: string
  name: string
}

interface AudioUrls {
  speak_url: string
  tSpeak_url: string
  [key: string]: string
}

const languages: Language[] = [
  {code: 'auto', name: '自动检测'},
  {code: 'zh', name: '中文'},
  {code: 'en', name: '英文'}
]

const inputText = ref('')
const sourceLang = useLocalStorage(LocalName.PAGE_APP_FAN_YI_UAPIS_PTS_SOURCE_LANG, '')
const targetLang = useLocalStorage(LocalName.PAGE_APP_FAN_YI_UAPIS_PTS_TARGET_LANG, 'en')
const tone = ref('')
const loading = ref(false)
const isStreaming = ref(false)
const translatedText = ref('')
const detectedLang = ref('')
const processingTime = ref(0)
const audioUrls = ref<AudioUrls>({
  speak_url: '',
  tSpeak_url: ''
})
const error = ref('')
let abortController: AbortController | null = null
let startTime = 0

const currentAudio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const audioProgress = ref(0)
const audioDuration = ref(0)
const currentAudioUrl = ref('')
const audioVolume = ref(1)

const extraAudioUrls = computed(() => {
  const urls: Record<string, string> = {}
  Object.keys(audioUrls.value).forEach(key => {
    if (key !== 'speak_url' && key !== 'tSpeak_url') {
      const value = audioUrls.value[key]
      if (value) {
        urls[key] = value
      }
    }
  })
  return urls
})

async function handleTranslate() {
  if (!inputText.value.trim() || !targetLang.value) {
    error.value = '请输入待翻译文本并选择目标语言'
    return
  }

  loading.value = true
  isStreaming.value = true
  error.value = ''
  translatedText.value = ''
  detectedLang.value = ''
  processingTime.value = 0
  audioUrls.value = {
    speak_url: '',
    tSpeak_url: ''
  }

  abortController = new AbortController()
  startTime = Date.now()

  try {
    const response = await fetch('https://uapis.cn/api/v1/translate/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: inputText.value,
        to_lang: targetLang.value,
        from_lang: sourceLang.value || 'auto',
        tone: tone.value || undefined
      }),
      signal: abortController.signal
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('无法读取响应流')
    }

    let buffer = ''
    let currentEvent = ''
    let currentData = ''

    while (true) {
      const {done, value} = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, {stream: true})
      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() || ''

      for (const chunk of chunks) {
        if (chunk.trim() === '') continue

        const lines = chunk.split('\n')
        currentEvent = ''
        currentData = ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim()
          } else if (line.startsWith('data: ')) {
            currentData = line.substring(6).trim()
          }
        }

        if (currentEvent === 'start') {
          console.log('翻译开始')
        } else if (currentEvent === 'message' && currentData) {
          try {
            const messageData = JSON.parse(currentData)
            if (messageData.content) {
              translatedText.value += messageData.content
            }
          } catch (e) {
            console.error('解析消息数据失败:', e)
          }
        } else if (currentEvent === 'audio' && currentData) {
          try {
            const audioData = JSON.parse(currentData)
            audioUrls.value = {
              speak_url: audioData.speak_url || '',
              tSpeak_url: audioData.tSpeak_url || '',
              ...Object.fromEntries(
                Object.entries(audioData).filter(([key]) => 
                  key !== 'speak_url' && key !== 'tSpeak_url'
                )
              )
            }
          } catch (e) {
            console.error('解析音频数据失败:', e)
          }
        } else if (currentEvent === 'end') {
          console.log('翻译结束')
          isStreaming.value = false
          processingTime.value = Date.now() - startTime
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('翻译已停止')
    } else {
      error.value = err.message || '翻译请求失败'
    }
  } finally {
    loading.value = false
    isStreaming.value = false
    abortController = null
  }
}

function handleStop() {
  if (abortController) {
    abortController.abort()
  }
}

function stopAudio() {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    isPlaying.value = false
    audioProgress.value = 0
  }
}

function togglePlayPause() {
  if (!currentAudio.value) return

  if (isPlaying.value) {
    currentAudio.value.pause()
    isPlaying.value = false
  } else {
    currentAudio.value.play()
    isPlaying.value = true
  }
}

function playAudio(url: string) {
  if (!url) return

  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
  }

  const audio = new Audio(url)
  audio.volume = audioVolume.value
  
  audio.addEventListener('loadedmetadata', () => {
    audioDuration.value = audio.duration
  })

  audio.addEventListener('timeupdate', () => {
    audioProgress.value = (audio.currentTime / audio.duration) * 100
  })

  audio.addEventListener('ended', () => {
    isPlaying.value = false
    audioProgress.value = 0
  })

  audio.addEventListener('error', () => {
    error.value = '音频播放失败，请稍后重试'
    isPlaying.value = false
  })

  audio.play().then(() => {
    currentAudio.value = audio
    currentAudioUrl.value = url
    isPlaying.value = true
  }).catch(err => {
    console.error('音频播放失败:', err)
    error.value = '音频播放失败，请稍后重试'
  })
}

function seekAudio(percent: number) {
  if (currentAudio.value) {
    const time = (percent / 100) * audioDuration.value
    currentAudio.value.currentTime = time
  }
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getLanguageName(code: string): string {
  const lang = languages.find(l => l.code === code)
  return lang ? lang.name : code
}

onUnmounted(() => {
  if (abortController) {
    abortController.abort()
  }
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    currentAudio.value = null
  }
})
</script>

<style scoped lang="less">
.fanyi-u-api-stream {
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

  .error-section {
    margin-bottom: 16px;
  }

  .result-content {
    .meta-info {
      margin-bottom: 20px;

      .streaming-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        background-color: var(--td-success-color-6);
        border-radius: 50%;
        animation: pulse 1.5s infinite;
        margin-right: 4px;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
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
        position: relative;

        &.translated {
          background: var(--td-success-color-1);
          border-color: var(--td-success-color-3);

          .cursor {
            display: inline-block;
            width: 2px;
            height: 1em;
            background-color: var(--td-success-color-6);
            margin-left: 2px;
            vertical-align: text-bottom;
            animation: blink 0.8s infinite;
          }

          @keyframes blink {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
          }
        }
      }

      .audio-player {
        margin-top: 12px;
        padding: 12px;
        background: var(--td-bg-color-page);
        border: 1px solid var(--td-component-border);
        border-radius: var(--td-radius-default);

        .player-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .progress-section {
          display: flex;
          align-items: center;
          gap: 12px;

          .time {
            font-size: 12px;
            color: var(--td-text-color-secondary);
            min-width: 40px;
            text-align: center;
          }

          .progress-bar {
            flex: 1;
            height: 6px;
            background: var(--td-bg-color-container);
            border-radius: 3px;
            cursor: pointer;
            position: relative;
            overflow: hidden;

            .progress-fill {
              height: 100%;
              background: var(--td-brand-color);
              border-radius: 3px;
              transition: width 0.1s linear;
            }

            &:hover {
              .progress-fill {
                background: var(--td-brand-color-hover);
              }
            }
          }
        }
      }
    }

    .audio-section {
      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--td-text-color-secondary);
        margin-bottom: 12px;
      }

      .audio-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;

        .label {
          font-size: 13px;
          color: var(--td-text-color-secondary);
        }
      }
    }
  }
}
</style>
