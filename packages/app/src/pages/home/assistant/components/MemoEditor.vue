<template>
  <div class="memo-editor-section">
    <div class="editor-card monica-card">
      <div
        class="editor-wrapper"
        ref="editorWrapperRef"
        :class="{ focused: isFocused }"
        @mousedown="handleEditorMouseDown"
      >
        <Transition name="editor-collapse" mode="out-in">
          <div v-if="!isFocused" key="collapsed" class="editor-collapsed">
            <div class="collapsed-placeholder">
              <span class="placeholder-icon">📝</span>
              <span v-if="!memoContent" class="placeholder-text">今天想记录什么呢？</span>
              <span v-else class="placeholder-content">{{ memoContent }}</span>
            </div>
            <div class="collapsed-actions">
              <span v-if="selectedMood" class="collapsed-mood">{{ selectedMood }}</span>
              <span v-if="atPartner" class="collapsed-at">@{{ atPartner.name }}</span>
            </div>
          </div>

          <div v-else key="expanded" class="editor-expanded">
            <textarea
              ref="textareaRef"
              v-model="memoContent"
              class="memo-textarea monica-input"
              placeholder="今天想记录什么呢？可以是心情、想法、或者任何想说的话..."
              :rows="isFocused ? 5 : 1"
              @focus="isFocused = true"
            ></textarea>

            <div class="editor-toolbar">
              <div class="at-section">
                <span v-if="atPartner" class="at-tag monica-tag">
                  @{{ atPartner.name }}
                  <span class="at-remove" @click="atPartner = null">×</span>
                </span>
                <button class="at-btn" @click="openPartnerSelector">
                  <span class="at-icon">@</span>
                  <span>呼唤伙伴</span>
                </button>
              </div>
              <div class="mood-selector">
                <span
                  v-for="mood in moods"
                  :key="mood.emoji"
                  class="mood-item"
                  :class="{ active: selectedMood === mood.emoji }"
                  @click="selectedMood = mood.emoji"
                  :title="mood.name"
                >
                  {{ mood.emoji }}
                </span>
              </div>
            </div>

            <div class="editor-footer">
              <div class="char-count">{{ memoContent.length }}/500</div>
              <button class="publish-btn monica-btn" @click="publishMemo" :disabled="!memoContent.trim()">
                <span class="publish-icon">✨</span>
                <span>发布Memo</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Partner {
  id: string
  name: string
  avatar: string
  description: string
  personality: string
}

const emit = defineEmits<{
  (e: 'at-partner', callback: (partner: Partner) => void): void
  (e: 'publish', data: { content: string; mood: string; atPartner: Partner | null }): void
}>()

const memoContent = ref('')
const atPartner = ref<Partner | null>(null)
const selectedMood = ref('')
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const editorWrapperRef = ref<HTMLElement | null>(null)

const moods = [
  { emoji: '😊', name: '开心' },
  { emoji: '😢', name: '难过' },
  { emoji: '😴', name: '疲惫' },
  { emoji: '😡', name: '生气' },
  { emoji: '🤔', name: '思考' },
  { emoji: '😍', name: '幸福' },
  { emoji: '😰', name: '焦虑' },
  { emoji: '🥳', name: '兴奋' }
]

const handleEditorMouseDown = (e: MouseEvent) => {
  if (!isFocused.value) {
    e.preventDefault()
    isFocused.value = true
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (editorWrapperRef.value && !editorWrapperRef.value.contains(e.target as Node)) {
    isFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const openPartnerSelector = () => {
  emit('at-partner', (partner: Partner) => {
    atPartner.value = partner
    nextTick(() => {
      textareaRef.value?.focus()
    })
  })
}

const publishMemo = () => {
  if (!memoContent.value.trim()) return

  emit('publish', {
    content: memoContent.value,
    mood: selectedMood.value || '😊',
    atPartner: atPartner.value
  })

  memoContent.value = ''
  atPartner.value = null
  selectedMood.value = ''
  isFocused.value = false
}
</script>

<style scoped lang="less">
@import "less/MemoEditor.less";
</style>
