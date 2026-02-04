<template>
  <div class="monica-container">
    <div class="monica-nav">
      <div class="nav-menu">
        <div
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: currentPage === item.id }"
          @click="currentPage = item.id"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </div>
      </div>
      <div class="nav-time">
        <t-dropdown trigger="click">
          <t-button theme="primary" variant="text" shape="square">
            <template #icon>
              <view-list-icon/>
            </template>
          </t-button>
          <t-dropdown-menu>
            <t-dropdown-item @click="toSetting">
              <template #prefix-icon>
                <setting-icon/>
              </template>
              设置
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </div>
    </div>

    <div class="monica-content">
      <Transition name="monica-page" mode="out-in">
        <ChatPage v-if="currentPage === 'chat'"/>
        <MemoHome
          v-else-if="currentPage === 'home'"
          @at-partner="openPartnerSelector"
        />
        <FriendPage
          v-else-if="currentPage === 'partner'"
        />
        <MomentsPage
          v-else-if="currentPage === 'moments'"
        />
        <DiaryPage
          v-else-if="currentPage === 'diary'"
        />
        <MemoryPage
          v-else-if="currentPage === 'memory'"
        />
        <ToolsPage
          v-else-if="currentPage === 'tools'"
        />
      </Transition>
    </div>

    <Transition name="monica-page">
      <div v-if="showPartnerSelector" class="partner-selector-overlay" @click.self="showPartnerSelector = false">
        <div class="partner-selector-popup">
          <div class="selector-header">
            <span class="selector-title">选择要 @ 的伙伴</span>
            <span class="selector-close" @click="showPartnerSelector = false">×</span>
          </div>
          <div class="selector-content">
            <div
              v-for="partner in partners"
              :key="partner.id"
              class="selector-item"
              @click="selectPartner(partner)"
            >
              <XhAvatar :value="partner.avatar ?? defaultAvatar" class="selector-avatar"/>
              <div class="selector-info">
                <span class="selector-name">{{ partner.name }}</span>
                <span class="selector-desc">{{ partner.personality_prompt }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import MemoHome from './components/memo/MemoHome.vue'
import FriendPage from './components/friend/FriendPage.vue'
import MomentsPage from './components/moment/MomentsPage.vue'
import DiaryPage from './components/diary/DiaryPage.vue'
import ToolsPage from './components/ToolsPage.vue'
import MemoryPage from './components/memory/MemoryPage.vue'
import ChatPage from "@/pages/home/assistant/components/chat/ChatPage.vue";
import {LocalName} from "@/global/LocalName.ts";
import type {MemoFriendStaticView} from '@/entity/memo'
import {useMemoFriendStore} from '@/store/MemoFriendStore'
import {SettingIcon, ViewListIcon} from "tdesign-icons-vue-next";


const router = useRouter();

const navItems = [
  {id: 'chat', label: '消息', icon: '💬'},
  {id: 'home', label: 'Memo', icon: '📝'},
  {id: 'partner', label: '伙伴', icon: '👥'},
  {id: 'moments', label: '朋友圈', icon: '🌸'},
  {id: 'diary', label: '日记', icon: '📅'},
  {id: 'memory', label: '记忆', icon: '🧠'},
  {id: 'tools', label: '工具', icon: '🧰'}
]

const currentPage = useSessionStorage(LocalName.PAGE_HOME_ASSISTANT_ACTIVE, 'chat');
const showPartnerSelector = ref(false)
const selectedMemoPartner = ref<((partner: MemoFriendStaticView) => void) | null>(null)
const defaultAvatar = 'https://api.dicebear.com/7.x/personas/svg?seed=default'

const {friends, loadFriends} = useMemoFriendStore()
const partners = computed(() => friends.filter(f => f.is_active === 1))

const openPartnerSelector = (callback: (partner: MemoFriendStaticView) => void) => {
  selectedMemoPartner.value = callback
  showPartnerSelector.value = true
}

const selectPartner = (partner: MemoFriendStaticView) => {
  if (selectedMemoPartner.value) {
    selectedMemoPartner.value(partner)
  }
  showPartnerSelector.value = false
  selectedMemoPartner.value = null
}

const toSetting = () => {
  router.push('/admin/global-setting')
}

onMounted(async () => {
  await loadFriends()
})

</script>

<style scoped lang="less">
@import 'home-assistant.less';
</style>
