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
              <span v-if="!plainTextContent" class="placeholder-text">今天想记录什么呢？</span>
              <span v-else class="placeholder-content">{{ plainTextContent }}</span>
            </div>
            <div class="collapsed-actions">
              <span v-if="atFriends.length > 0" class="collapsed-at">@{{ atFriends.length }}位伙伴</span>
            </div>
          </div>

          <div v-else key="expanded" class="editor-expanded">
            <div
              ref="editorRef"
              class="memo-editor monica-input"
              contenteditable="true"
              placeholder="今天想记录什么呢？可以是心情、想法、或者任何想说的话...输入 @ 呼唤伙伴"
              @input="handleInput"
              @keydown="handleKeydown"
              @focus="isFocused = true"
              @click="handleEditorClick"
            ></div>

            <!-- @ 下拉选择列表 -->
            <div
              v-if="showAtDropdown"
              class="at-dropdown"
              :style="dropdownPosition"
            >
              <div class="at-dropdown-header">
                <span>选择伙伴</span>
                <span class="at-hint">按 ESC 关闭</span>
              </div>
              <div class="at-dropdown-list">
                <div
                  v-for="(friend, index) in filteredFriends"
                  :key="friend.id"
                  class="at-dropdown-item"
                  :class="{ active: selectedIndex === index }"
                  @click="selectFriend(friend)"
                  @mouseenter="selectedIndex = index"
                >
                  <img :src="friend.avatar" class="at-dropdown-avatar" />
                  <div class="at-dropdown-info">
                    <span class="at-dropdown-name">{{ friend.name }}</span>
                    <span class="at-dropdown-desc">{{ friend.relation || friend.archetype }}</span>
                  </div>
                </div>
                <div v-if="filteredFriends.length === 0" class="at-dropdown-empty">
                  未找到匹配的伙伴
                </div>
              </div>
            </div>

            <div class="editor-toolbar">
            </div>

            <div class="editor-footer">
              <div class="footer-left">
                <div class="type-selector">
                  <label class="type-radio">
                    <input
                      type="radio"
                      v-model="memoType"
                      value="normal"
                    />
                    <span class="radio-label">普通</span>
                  </label>
                  <label class="type-radio">
                    <input
                      type="radio"
                      v-model="memoType"
                      value="memo"
                    />
                    <span class="radio-label">备忘</span>
                  </label>
                  <label class="type-radio">
                    <input
                      type="radio"
                      v-model="memoType"
                      value="private"
                    />
                    <span class="radio-label">私密</span>
                  </label>
                </div>
                <div class="char-count">{{ plainTextContent.length }}/500</div>
              </div>
              <button class="publish-btn monica-btn" @click="publishMemo" :disabled="!plainTextContent.trim()">
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
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import {useMemoFriendStore} from "@/store/MemoFriendStore.ts";
import type { MemoItemType } from '@/entity/memo';
import type { MemoFriend } from '@/entity/memo';

const emit = defineEmits<{
  (e: 'publish', data: { content: string; type: MemoItemType; atFriends: string[] }): void
}>()

// 编辑器状态
const memoContent = ref('')
const plainTextContent = ref('')
const memoType = ref<MemoItemType>('normal')
const isFocused = ref(false)
const editorRef = ref<HTMLElement | null>(null)
const editorWrapperRef = ref<HTMLElement | null>(null)

// @ 功能状态
const showAtDropdown = ref(false)
const atQuery = ref('')
const selectedIndex = ref(0)
const atFriends = ref<MemoFriend[]>([])
const dropdownPosition = ref({ top: '0px', left: '0px' })

// 存储 @ 标签的位置信息

const friends = computed(() => useMemoFriendStore().friends)

const filteredFriends = computed(() => {
  if (!atQuery.value) return friends.value
  return friends.value.filter(f => f.name.toLowerCase().includes(atQuery.value.toLowerCase()))
})

// 处理编辑器点击
const handleEditorClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('at-tag')) {
    const friendId = target.getAttribute('data-friend-id')
    if (friendId) {
      removeAtFriend(friendId)
    }
  }
}

// 处理输入
const handleInput = () => {
  if (!editorRef.value) return
  
  updateContent()
  checkAtTrigger()
}

// 更新内容
const updateContent = () => {
  if (!editorRef.value) return
  
  // 提取纯文本内容
  plainTextContent.value = editorRef.value.innerText || ''
  
  // 提取 HTML 内容（用于保存）
  memoContent.value = editorRef.value.innerHTML
}

// 检查 @ 触发
const checkAtTrigger = () => {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return
  
  const range = selection.getRangeAt(0)
  const textContent = range.startContainer.textContent || ''
  const cursorPosition = range.startOffset
  
  // 获取光标前的文本
  const beforeCursor = textContent.substring(0, cursorPosition)
  
  // 检查是否触发了 @
  const atMatch = beforeCursor.match(/@([^\s@]*)$/)
  
  if (atMatch) {
    atQuery.value = atMatch[1]!
    showAtDropdown.value = true
    selectedIndex.value = 0
    updateDropdownPosition()
  } else {
    showAtDropdown.value = false
  }
}

// 更新下拉菜单位置
const updateDropdownPosition = () => {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return
  
  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  const editorRect = editorRef.value?.getBoundingClientRect()
  
  if (editorRect) {
    dropdownPosition.value = {
      top: `${rect.bottom - editorRect.top + 8}px`,
      left: `${rect.left - editorRect.left}px`
    }
  }
}

// 处理键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (showAtDropdown.value) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        selectedIndex.value = (selectedIndex.value + 1) % filteredFriends.value.length
        break
      case 'ArrowUp':
        e.preventDefault()
        selectedIndex.value = (selectedIndex.value - 1 + filteredFriends.value.length) % filteredFriends.value.length
        break
      case 'Enter':
        e.preventDefault()
        if (filteredFriends.value[selectedIndex.value]) {
          selectFriend(filteredFriends.value[selectedIndex.value]!)
        }
        break
      case 'Escape':
        showAtDropdown.value = false
        break
    }
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    publishMemo()
  }
}

// 选择 friend
const selectFriend = (friend: MemoFriend) => {
  if (!editorRef.value) return
  
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return
  
  // 找到 @ 的位置并替换
  const range = selection.getRangeAt(0)
  const textNode = range.startContainer
  
  if (textNode.nodeType === Node.TEXT_NODE) {
    const text = textNode.textContent || ''
    const cursorPosition = range.startOffset
    const beforeCursor = text.substring(0, cursorPosition)
    const afterCursor = text.substring(cursorPosition)
    
    // 找到 @ 的位置
    const atIndex = beforeCursor.lastIndexOf('@')
    
    if (atIndex !== -1) {
      // 创建 @ 标签元素
      const atTag = document.createElement('span')
      atTag.className = 'at-tag'
      atTag.contentEditable = 'false'
      atTag.setAttribute('data-friend-id', friend.id)
      atTag.innerHTML = `@${friend.name}<span class="at-remove">×</span>`
      
      // 替换 @query 为标签
      const beforeAt = text.substring(0, atIndex)
      const newTextNode = document.createTextNode(beforeAt)
      
      const parent = textNode.parentNode
      if (parent) {
        parent.insertBefore(newTextNode, textNode)
        parent.insertBefore(atTag, textNode)
        textNode.textContent = '\u00A0' + afterCursor // 添加空格
        
        // 移动光标到标签后
        range.setStart(textNode, 1)
        range.setEnd(textNode, 1)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      
      // 添加到已选列表
      if (!atFriends.value.find(f => f.id === friend.id)) {
        atFriends.value.push(friend)
      }
    }
  }
  
  showAtDropdown.value = false
  updateContent()
}

// 移除 @ 的 friend
const removeAtFriend = (friendId: string) => {
  if (!editorRef.value) return
  
  // 从列表中移除
  atFriends.value = atFriends.value.filter(f => f.id !== friendId)
  
  // 从编辑器中移除标签
  const atTag = editorRef.value.querySelector(`[data-friend-id="${friendId}"]`)
  if (atTag && atTag.parentNode) {
    // 移除标签并合并相邻文本节点
    const textContent = atTag.textContent || ''
    const textNode = document.createTextNode(textContent.replace(/×$/, ''))
    atTag.parentNode.replaceChild(textNode, atTag)
    
    // 合并相邻文本节点
    editorRef.value.normalize()
  }
  
  updateContent()
}

// 解析内容，提取 @ 的 friends
const parseContent = (): { content: string; atFriendIds: string[] } => {
  if (!editorRef.value) return { content: '', atFriendIds: [] }
  
  const atFriendIds: string[] = []
  const clonedEditor = editorRef.value.cloneNode(true) as HTMLElement
  
  // 提取所有 @ 标签的 friend ID
  const atTags = clonedEditor.querySelectorAll('.at-tag')
  atTags.forEach(tag => {
    const friendId = tag.getAttribute('data-friend-id')
    if (friendId) {
      atFriendIds.push(friendId)
      // 将标签替换为文本形式
      const textNode = document.createTextNode(`@${tag.textContent?.replace('×', '') || ''}`)
      tag.parentNode?.replaceChild(textNode, tag)
    }
  })
  
  // 合并文本节点并获取纯文本
  clonedEditor.normalize()
  
  return {
    content: clonedEditor.innerText || '',
    atFriendIds: [...new Set(atFriendIds)] // 去重
  }
}

const handleEditorMouseDown = (e: MouseEvent) => {
  if (!isFocused.value) {
    e.preventDefault()
    isFocused.value = true
    nextTick(() => {
      editorRef.value?.focus()
    })
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (editorWrapperRef.value && !editorWrapperRef.value.contains(e.target as Node)) {
    isFocused.value = false
    showAtDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const publishMemo = () => {
  if (!plainTextContent.value.trim()) return
  
  const { content, atFriendIds } = parseContent()
  
  emit('publish', {
    content: content,
    type: memoType.value,
    atFriends: atFriendIds
  })
  
  // 重置编辑器
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
  }
  memoContent.value = ''
  plainTextContent.value = ''
  atFriends.value = []
  isFocused.value = false
}
</script>

<style scoped lang="less">
@import "less/MemoEditor.less";
</style>
