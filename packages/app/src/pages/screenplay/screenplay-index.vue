<template>
  <div class="screenplay-container">
    <aside class="role-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">
          <app-tool-back />
          角色管理
        </h3>
        <t-button theme="primary" size="small" class="!ml-auto" @click="addRole">
          <template #icon>
            <add-icon />
          </template>
          新增角色
        </t-button>
      </div>
      <div class="role-list">
        <div
          v-for="role in roles"
          :key="role.id"
          :class="['role-card', { 'role-active': selectedRoleId === role.id, 'role-narrator': role.in_narrator }]"
          @click="selectRole(role.id)"
        >
          <div class="role-avatar">
            {{ role.name.charAt(0) }}
          </div>
          <div class="role-info">
            <div class="role-name">{{ role.name }}</div>
            <div class="role-identity">{{ role.identity }}</div>
          </div>
          <t-tag v-if="role.in_narrator" theme="primary" size="small" variant="light" class="role-badge">叙述者</t-tag>
        </div>
      </div>
      <t-card v-if="selectedRole" class="role-detail" :bordered="false">
        <div class="detail-header">
          <h4>{{ selectedRole.name }}</h4>
          <t-button theme="default" variant="text" size="small" @click="editRole">
            <edit-icon />
          </t-button>
        </div>
        <div class="detail-section">
          <t-divider></t-divider>
          <t-tag theme="default" size="small" variant="light">公开身份</t-tag>
          <p>{{ selectedRole.identity }}</p>
        </div>
        <div class="detail-section">
          <t-tag theme="default" size="small" variant="light">性格描述</t-tag>
          <p>{{ selectedRole.personality }}</p>
        </div>
        <div class="detail-section">
          <t-tag theme="warning" size="small" variant="light">私有信息</t-tag>
          <p>{{ selectedRole.secret_info }}</p>
        </div>
      </t-card>
    </aside>

    <main class="main-content">
      <header class="scene-timeline">
        <div class="timeline-container">
          <div
            v-for="scene in scenes"
            :key="scene.id"
            :class="['timeline-item', { 'timeline-current': currentSceneId === scene.id, 'timeline-past': scene.order_index < currentSceneIndex }]"
            @click="switchScene(scene.id)"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-scene-name">{{ scene.name }}</div>
              <div class="timeline-scene-desc">{{ scene.description }}</div>
            </div>
          </div>
        </div>
      </header>

      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="dialogue in dialogues"
            :key="dialogue.id"
            :class="['message-item', `message-${dialogue.type}`]"
          >
            <div v-if="dialogue.type === 'role'" class="message-role">
              <div class="message-avatar">
                {{ getRoleName(dialogue.role_id)?.charAt(0) }}
              </div>
              <div class="message-content">
                <div class="message-sender">{{ getRoleName(dialogue.role_id) }}</div>
                <div v-if="dialogue.action" class="message-action">{{ dialogue.action }}</div>
                <t-card :bordered="false" class="message-card">
                  {{ dialogue.dialogue }}
                </t-card>
              </div>
            </div>
            <div v-else-if="dialogue.type === 'narrator'" class="message-narrator">
              <div class="narrator-icon">📖</div>
              <div class="message-content">
                <div class="message-sender">叙述者</div>
                <div v-if="dialogue.action" class="message-action">{{ dialogue.action }}</div>
                <t-card :bordered="false" theme="primary" variant="light" class="message-card">
                  {{ dialogue.dialogue }}
                </t-card>
              </div>
            </div>
            <div v-else-if="dialogue.type === 'event'" class="message-event">
              <div class="event-icon">⚡</div>
              <div class="message-content">
                <div class="message-sender">突发事件</div>
                <t-card :bordered="false" theme="warning" variant="light" class="message-card">
                  {{ dialogue.dialogue }}
                </t-card>
              </div>
            </div>
            <div v-else-if="dialogue.type === 'system'" class="message-system">
              <t-tag theme="default" size="small" variant="outline">{{ dialogue.dialogue }}</t-tag>
            </div>
          </div>
        </div>

        <div class="control-panel">
          <t-space size="small" break-line>
            <t-button theme="primary" @click="enterScene">
              <template #icon>
                <login-icon />
              </template>
              进入场景
            </t-button>
            <t-button theme="warning" variant="outline" @click="triggerEvent">
              <template #icon>
                <error-circle-icon />
              </template>
              突发事件
            </t-button>
            <t-button theme="default" @click="advanceStory">
              <template #icon>
                <chevron-right-icon />
              </template>
              推进剧情
            </t-button>
            <t-button theme="default" variant="outline" @click="pauseStory">
              <template #icon>
                <pause-circle-icon />
              </template>
              暂停
            </t-button>
            <t-button theme="default" variant="dashed" @click="addScene">
              <template #icon>
                <add-icon />
              </template>
              新场景
            </t-button>
          </t-space>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import type { SpRole, SpScene, SpDialogue } from '@/entity/screenplay'
import {
  AddIcon,
  EditIcon,
  LoginIcon,
  ErrorCircleIcon,
  ChevronRightIcon,
  PauseCircleIcon
} from 'tdesign-icons-vue-next'

const roles = ref<SpRole[]>([])
const scenes = ref<SpScene[]>([])
const dialogues = ref<SpDialogue[]>([])
const selectedRoleId = ref<string>('')
const currentSceneId = ref<string>('')

const chatMessagesRef = ref<HTMLElement>()

const selectedRole = computed(() => roles.value.find(r => r.id === selectedRoleId.value))
const currentScene = computed(() => scenes.value.find(s => s.id === currentSceneId.value))
const currentSceneIndex = computed(() => {
  const scene = scenes.value.find(s => s.id === currentSceneId.value)
  return scene?.order_index ?? 0
})

const getRoleName = (roleId: string) => {
  const role = roles.value.find(r => r.id === roleId)
  return role?.name || '未知角色'
}

const addRole = () => {
  console.log('Add role')
}

const selectRole = (id: string) => {
  selectedRoleId.value = id
}

const editRole = () => {
  console.log('Edit role:', selectedRole.value)
}

const switchScene = (sceneId: string) => {
  currentSceneId.value = sceneId
  loadDialogues(sceneId)
}

const enterScene = () => {
  console.log('Enter scene:', currentScene.value)
}

const triggerEvent = () => {
  console.log('Trigger event')
}

const advanceStory = () => {
  console.log('Advance story')
}

const pauseStory = () => {
  console.log('Pause story')
}

const addScene = () => {
  console.log('Add scene')
}

const loadDialogues = (sceneId: string) => {
  console.log('Load dialogues for scene:', sceneId)
}

onMounted(() => {
  roles.value = [
    {
      id: '1',
      screenplay_id: '1',
      name: '李维',
      identity: '前AI工程师',
      secret_info: '曾参与秘密AI项目',
      personality: '理性、谨慎、有责任感',
      in_narrator: 0,
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '2',
      screenplay_id: '1',
      name: '张明',
      identity: '科技公司CEO',
      secret_info: '公司面临巨大危机',
      personality: '果断、野心勃勃、有时冲动',
      in_narrator: 0,
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '3',
      screenplay_id: '1',
      name: '叙述者',
      identity: '故事讲述者',
      secret_info: '',
      personality: '客观、冷静、富有洞察力',
      in_narrator: 1,
      created_at: Date.now(),
      updated_at: Date.now()
    }
  ]

  scenes.value = [
    {
      id: '1',
      screenplay_id: '1',
      name: '市政厅会议室',
      description: '清晨，阳光透过落地窗洒在会议桌上',
      order_index: 1,
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '2',
      screenplay_id: '1',
      name: '科技公司办公室',
      description: '深夜，办公室灯火通明',
      order_index: 2,
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '3',
      screenplay_id: '1',
      name: '城市广场',
      description: '黄昏，人群熙熙攘攘',
      order_index: 3,
      created_at: Date.now(),
      updated_at: Date.now()
    }
  ]

  dialogues.value = [
    {
      id: '1',
      screenplay_id: '1',
      scene_id: '1',
      turn_order: 1,
      type: 'narrator',
      role_id: '3',
      action: '故事开始',
      dialogue: '这是一个关于AI与人性的故事...',
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '2',
      screenplay_id: '1',
      scene_id: '1',
      turn_order: 2,
      type: 'role',
      role_id: '1',
      action: '攥紧拳头',
      dialogue: '我们必须做出决定。',
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '3',
      screenplay_id: '1',
      scene_id: '1',
      turn_order: 3,
      type: 'role',
      role_id: '2',
      action: '来回踱步',
      dialogue: '但这太冒险了！',
      created_at: Date.now(),
      updated_at: Date.now()
    }
  ]

  currentSceneId.value = scenes.value[0].id
  selectedRoleId.value = roles.value[0].id
})
</script>

<style scoped lang="less">
.screenplay-container {
  display: flex;
  height: 100vh;
  background: var(--td-bg-color-page);
  font-family: var(--td-font-family);
  overflow: hidden;
}

.role-sidebar {
  width: 320px;
  background: var(--fluent-sidebar-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-right: 1px solid var(--fluent-sidebar-border);
  display: flex;
  flex-direction: column;
  transition: var(--fluent-transition-normal);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--fluent-sidebar-border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-title {
  margin: 0;
  font: var(--td-font-title-medium);
  color: var(--td-text-color-primary);
}

.role-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--fluent-card-bg);
  border: 1px solid var(--fluent-card-border);
  border-radius: var(--fluent-radius-card);
  cursor: pointer;
  transition: all var(--fluent-transition-fast);
  position: relative;
}

.role-card:hover {
  background: var(--fluent-card-bg-hover);
  box-shadow: var(--fluent-card-shadow-hover);
  transform: translateY(-2px);
}

.role-active {
  background: var(--fluent-item-selected);
  border-color: var(--fluent-item-selected-border);
}

.role-narrator {
  border-left: 3px solid var(--fluent-accent-color);
}

.role-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--td-radius-circle);
  background: var(--fluent-gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font: var(--td-font-title-medium);
  color: white;
  margin-right: 12px;
  flex-shrink: 0;
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font: var(--td-font-subtitle-medium);
  color: var(--td-text-color-primary);
  margin-bottom: 4px;
}

.role-identity {
  font: var(--td-font-body-small);
  color: var(--td-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.role-detail {
  margin: 12px;
  background: var(--fluent-card-bg);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-header h4 {
  margin: 0;
  font: var(--td-font-subtitle-medium);
  color: var(--td-text-color-primary);
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section p {
  margin: 8px 0 0 0;
  font: var(--td-font-body-small);
  color: var(--td-text-color-secondary);
  line-height: var(--td-line-height-body-small);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scene-timeline {
  background: var(--fluent-acrylic-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-bottom: 1px solid var(--fluent-border-subtle);
  padding: 16px 24px;
  overflow-x: auto;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.timeline-title {
  margin: 0;
  font: var(--td-font-title-medium);
  color: var(--td-text-color-primary);
}

.timeline-container {
  display: flex;
  gap: 24px;
  min-width: max-content;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: all var(--fluent-transition-fast);
  opacity: 0.6;
}

.timeline-item:hover {
  opacity: 1;
}

.timeline-current {
  opacity: 1;
}

.timeline-past {
  opacity: 0.4;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--td-radius-circle);
  background: var(--td-text-color-placeholder);
  margin-top: 6px;
  margin-right: 12px;
  flex-shrink: 0;
  transition: all var(--fluent-transition-fast);
}

.timeline-current .timeline-dot {
  background: var(--fluent-accent-color);
  box-shadow: 0 0 0 4px var(--fluent-accent-light);
}

.timeline-past .timeline-dot {
  background: var(--td-success-color);
}

.timeline-content {
  max-width: 200px;
}

.timeline-scene-name {
  font: var(--td-font-subtitle-small);
  color: var(--td-text-color-primary);
  margin-bottom: 4px;
}

.timeline-scene-desc {
  font: var(--td-font-caption);
  color: var(--td-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--td-bg-color-page);
}

.message-item {
  margin-bottom: 24px;
  animation: fadeIn var(--fluent-transition-normal);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-role {
  display: flex;
  gap: 12px;
}

.message-narrator {
  display: flex;
  gap: 12px;
}

.message-event {
  display: flex;
  gap: 12px;
}

.message-system {
  display: flex;
  justify-content: center;
  padding: 12px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--td-radius-circle);
  background: var(--fluent-gradient-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font: var(--td-font-subtitle-medium);
  color: white;
  flex-shrink: 0;
}

.narrator-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--td-radius-circle);
  background: var(--td-brand-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--td-radius-circle);
  background: var(--td-warning-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-sender {
  font: var(--td-font-caption);
  color: var(--td-text-color-placeholder);
  margin-bottom: 4px;
}

.message-action {
  font: var(--td-font-body-small);
  color: var(--td-text-color-secondary);
  font-style: italic;
  margin-bottom: 8px;
}

.message-card {
  font: var(--td-font-body-medium);
  color: var(--td-text-color-primary);
  line-height: var(--td-line-height-body-medium);
  box-shadow: var(--fluent-elevation-1);
}

.narrator-card {
  background: var(--fluent-accent-light);
  border-left: 3px solid var(--fluent-accent-color);
}

.event-card {
  background: var(--td-warning-color-1);
  border-left: 3px solid var(--td-warning-color);
}

.control-panel {
  padding: 20px 24px;
  background: var(--fluent-acrylic-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-top: 1px solid var(--fluent-border-subtle);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--td-scroll-track-color);
  border-radius: var(--td-radius-default);
}

::-webkit-scrollbar-thumb {
  background: var(--td-scrollbar-color);
  border-radius: var(--td-radius-default);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--td-scrollbar-hover-color);
}
</style>
