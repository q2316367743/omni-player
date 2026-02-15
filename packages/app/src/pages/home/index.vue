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
    </div>

    <div class="monica-content">
      <Transition name="monica-page" mode="out-in">
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="[]">
            <component :is="Component" :key="route.fullPath"/>
          </keep-alive>
        </router-view>
      </Transition>
    </div>

  </div>
</template>

<script lang="ts" setup>
import {LocalName} from "@/global/LocalName.ts";


const router = useRouter();

const navItems = [
  {id: 'chat', label: '消息', icon: '💬'},
  {id: 'memo', label: 'Memo', icon: '📝'},
  {id: 'friend', label: '伙伴', icon: '👥'},
  {id: 'moment', label: '朋友圈', icon: '🌸'},
  {id: 'diary', label: '日记', icon: '📅'},
  {id: 'memory', label: '记忆', icon: '🧠'},
]

const currentPage = useSessionStorage(LocalName.PAGE_HOME_ASSISTANT_ACTIVE, 'chat');

watch(currentPage, val => {
  router.push(`/home/${val}`)
}, {
  immediate: true
})
</script>

<style scoped lang="less">
@import 'index.less';
</style>
