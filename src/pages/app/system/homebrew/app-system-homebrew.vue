<template>
  <app-tool-layout title="Homebrew">
    <div class="homebrew-container">
      <div v-if="!isHomebrewAvailable" class="homebrew-not-available">
        <empty-result
          title="未检测到 Homebrew"
          tip="请先安装 Homebrew 以使用此功能"
        >
          <t-button theme="primary" @click="openHomebrewInstallGuide">
            安装 Homebrew
          </t-button>
        </empty-result>
      </div>

      <t-layout v-else class="homebrew-layout">
        <t-aside class="homebrew-aside">
          <div class="aside-search">
            <t-input
              v-model="searchKeyword"
              placeholder="搜索软件包..."
              clearable
              @input="handleSearch"
              @clear="handleClearSearch"
            >
              <template #prefix-icon>
                <search-icon />
              </template>
            </t-input>
          </div>

          <div class="aside-menu">
            <div
              v-for="item in menuItems"
              :key="item.key"
              class="menu-item"
              :class="{ active: activeMenu === item.key }"
              @click="handleMenuClick(item.key)"
            >
              <component :is="item.icon" size="20px" />
              <span class="menu-label">{{ item.label }}</span>
              <t-badge
                v-if="item.count > 0"
                :count="item.count"
                :max-count="99"
                theme="primary"
                size="small"
              />
            </div>

            <div class="menu-divider"></div>

            <div class="menu-section-title">分类</div>
            <div
              v-for="category in categories"
              :key="category"
              class="menu-item"
              :class="{ active: activeCategory === category && !isSearching }"
              @click="handleCategoryClick(category)"
            >
              <app-icon size="20px" />
              <span class="menu-label">{{ category }}</span>
            </div>
          </div>
        </t-aside>

        <t-content class="homebrew-content">
          <div v-if="showEmpty" class="content-empty">
            <empty-result
              title="探索 Homebrew 软件包"
              tip="搜索或选择分类以查看软件包"
            />
          </div>

          <div v-else class="content-list">
            <div class="list-header">
              <div class="list-title">
                {{ currentTitle }}
                <span v-if="filteredPackages.length > 0" class="list-count">
                  ({{ filteredPackages.length }})
                </span>
              </div>
            </div>

            <div v-if="loading" class="list-loading">
              <t-loading size="large" text="加载中..." />
            </div>

            <div v-else-if="filteredPackages.length === 0" class="list-empty">
              <empty-result
                title="未找到软件包"
                tip="尝试搜索其他关键字或选择其他分类"
              />
            </div>

            <div v-else class="package-grid">
              <div
                v-for="pkg in filteredPackages"
                :key="pkg.name"
                class="package-card"
              >
                <div class="package-header">
                  <div class="package-name">{{ pkg.name }}</div>
                  <t-tag
                    :theme="pkg.type === 'Cask' ? 'warning' : 'primary'"
                    size="small"
                  >
                    {{ pkg.type }}
                  </t-tag>
                </div>

                <div class="package-description">{{ pkg.description }}</div>

                <div class="package-info">
                  <span class="package-version">版本: {{ pkg.version }}</span>
                </div>

                <div class="package-status">
                  <t-tag
                    v-if="isInstalled(pkg.name)"
                    theme="success"
                    size="small"
                  >
                    已安装
                  </t-tag>
                  <t-tag
                    v-else-if="hasUpdate(pkg.name)"
                    theme="warning"
                    size="small"
                  >
                    可更新
                  </t-tag>
                </div>

                <div class="package-actions">
                  <t-button
                    v-if="!isInstalled(pkg.name)"
                    theme="primary"
                    size="small"
                    :loading="installingPackages.includes(pkg.name)"
                    @click="handleInstall(pkg)"
                  >
                    安装
                  </t-button>
                  <t-space v-else>
                    <t-button
                      v-if="hasUpdate(pkg.name)"
                      theme="warning"
                      size="small"
                      :loading="upgradingPackages.includes(pkg.name)"
                      @click="handleUpgrade(pkg)"
                    >
                      升级
                    </t-button>
                    <t-button
                      theme="danger"
                      variant="outline"
                      size="small"
                      :loading="uninstallingPackages.includes(pkg.name)"
                      @click="handleUninstall(pkg)"
                    >
                      卸载
                    </t-button>
                  </t-space>
                </div>
              </div>
            </div>
          </div>
        </t-content>
      </t-layout>
    </div>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next'
import { SearchIcon, DownloadIcon, RefreshIcon, CheckIcon, AppIcon } from 'tdesign-icons-vue-next'
import EmptyResult from '@/components/Result/EmptyResult.vue'
import * as homebrew from 'tauri-plugin-homebrew-api'
import type { HomebrewItem, HomebrewOutdatedItem } from '@/plugins/homebrew'

const isHomebrewAvailable = ref(false)
const loading = ref(false)
const searchKeyword = ref('')
const activeMenu = ref('')
const activeCategory = ref('')
const isSearching = ref(false)

const installedPackages = ref<HomebrewItem[]>([])
const outdatedPackages = ref<HomebrewOutdatedItem[]>([])
const searchResults = ref<HomebrewItem[]>([])

const installingPackages = ref<string[]>([])
const upgradingPackages = ref<string[]>([])
const uninstallingPackages = ref<string[]>([])

const categories = [
  '开发工具',
  '数据库',
  '网络工具',
  '文本编辑器',
  '图形工具',
  '系统工具',
  '媒体工具',
  '办公软件',
  '游戏',
  '其他'
]

const menuItems = computed(() => [
  {
    key: 'downloading',
    label: '下载中',
    icon: DownloadIcon,
    count: installingPackages.value.length
  },
  {
    key: 'updatable',
    label: '可更新',
    icon: RefreshIcon,
    count: outdatedPackages.value.length
  },
  {
    key: 'installed',
    label: '已安装',
    icon: CheckIcon,
    count: installedPackages.value.length
  }
])

const showEmpty = computed(() => {
  return !isSearching.value && !activeMenu.value && !activeCategory.value
})

const currentTitle = computed(() => {
  if (isSearching.value) return `搜索: ${searchKeyword.value}`
  if (activeMenu.value) {
    const item = menuItems.value.find(m => m.key === activeMenu.value)
    return item?.label || ''
  }
  if (activeCategory.value) return activeCategory.value
  return ''
})

const filteredPackages = computed(() => {
  if (isSearching.value) {
    return searchResults.value
  }
  
  if (activeMenu.value === 'installed') {
    return installedPackages.value
  }
  
  if (activeMenu.value === 'updatable') {
    return installedPackages.value.filter(pkg =>
      outdatedPackages.value.some(op => op.name === pkg.name)
    )
  }
  
  if (activeMenu.value === 'downloading') {
    return []
  }
  
  if (activeCategory.value) {
    return installedPackages.value.filter(pkg => {
      return pkg.description.toLowerCase().includes(activeCategory.value.toLowerCase())
    })
  }
  
  return []
})

const isInstalled = (name: string): boolean => {
  return installedPackages.value.some(pkg => pkg.name === name)
}

const hasUpdate = (name: string): boolean => {
  return outdatedPackages.value.some(pkg => pkg.name === name)
}

const checkHomebrewAvailable = async () => {
  try {
    isHomebrewAvailable.value = await homebrew.isAvailable()
    if (isHomebrewAvailable.value) {
      await loadInstalledPackages()
      await loadOutdatedPackages()
    }
  } catch (error) {
    console.error('检查 Homebrew 可用性失败:', error)
    isHomebrewAvailable.value = false
  }
}

const loadInstalledPackages = async () => {
  try {
    loading.value = true
    installedPackages.value = await homebrew.listInstalled()
  } catch (error) {
    console.error('加载已安装软件包失败:', error)
    MessagePlugin.error('加载已安装软件包失败')
  } finally {
    loading.value = false
  }
}

const loadOutdatedPackages = async () => {
  try {
    outdatedPackages.value = await homebrew.listOutdated()
  } catch (error) {
    console.error('加载可更新软件包失败:', error)
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    isSearching.value = false
    searchResults.value = []
    return
  }
  
  try {
    loading.value = true
    isSearching.value = true
    activeMenu.value = ''
    activeCategory.value = ''
    searchResults.value = await homebrew.search(searchKeyword.value)
  } catch (error) {
    console.error('搜索失败:', error)
    MessagePlugin.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  searchResults.value = []
}

const handleMenuClick = (key: string) => {
  activeMenu.value = key
  activeCategory.value = ''
  isSearching.value = false
}

const handleCategoryClick = (category: string) => {
  activeCategory.value = category
  activeMenu.value = ''
  isSearching.value = false
}

const handleInstall = async (pkg: HomebrewItem) => {
  try {
    installingPackages.value = [...installingPackages.value, pkg.name]
    await homebrew.install(pkg.name, { cask: pkg.type === 'Cask' })
    MessagePlugin.success(`${pkg.name} 安装成功`)
    await loadInstalledPackages()
    await loadOutdatedPackages()
  } catch (error) {
    console.error('安装失败:', error)
    MessagePlugin.error(`${pkg.name} 安装失败`)
  } finally {
    installingPackages.value = installingPackages.value.filter(n => n !== pkg.name)
  }
}

const handleUninstall = async (pkg: HomebrewItem) => {
  try {
    uninstallingPackages.value = [...uninstallingPackages.value, pkg.name]
    await homebrew.uninstall(pkg.name)
    MessagePlugin.success(`${pkg.name} 卸载成功`)
    await loadInstalledPackages()
    await loadOutdatedPackages()
  } catch (error) {
    console.error('卸载失败:', error)
    MessagePlugin.error(`${pkg.name} 卸载失败`)
  } finally {
    uninstallingPackages.value = uninstallingPackages.value.filter(n => n !== pkg.name)
  }
}

const handleUpgrade = async (pkg: HomebrewItem) => {
  try {
    upgradingPackages.value = [...upgradingPackages.value, pkg.name]
    await homebrew.upgrade(pkg.name)
    MessagePlugin.success(`${pkg.name} 升级成功`)
    await loadInstalledPackages()
    await loadOutdatedPackages()
  } catch (error) {
    console.error('升级失败:', error)
    MessagePlugin.error(`${pkg.name} 升级失败`)
  } finally {
    upgradingPackages.value = upgradingPackages.value.filter(n => n !== pkg.name)
  }
}

const openHomebrewInstallGuide = () => {
  window.open('https://brew.sh/', '_blank')
}

onMounted(() => {
  checkHomebrewAvailable()
})
</script>

<style scoped lang="less">
.homebrew-container {
  width: 100%;
  height: calc(100% - 32px);
  background: var(--td-bg-color-page);
}

.homebrew-not-available {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.homebrew-layout {
  height: 100%;
  display: flex;
  background: var(--fluent-card-bg);
  border-radius: var(--fluent-radius-large);
  margin: 16px;
  box-shadow: var(--fluent-elevation-2);
  border: 1px solid var(--fluent-border-subtle);
  overflow: hidden;
}

.homebrew-aside {
  width: 280px;
  background: var(--fluent-sidebar-bg);
  border-right: 1px solid var(--fluent-sidebar-border);
  display: flex;
  flex-direction: column;
  padding: var(--td-size-5);
  overflow-y: auto;
}

.aside-search {
  margin-bottom: var(--td-size-5);
}

:deep(.t-input) {
  border-radius: var(--fluent-radius-smooth);
  transition: all var(--fluent-transition-fast);

  &:hover {
    border-color: var(--td-brand-color-hover);
  }

  &:focus-within {
    border-color: var(--td-brand-color);
    box-shadow: var(--fluent-focus-ring);
  }
}

.aside-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-2);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--td-size-3);
  padding: var(--td-size-3) var(--td-size-4);
  border-radius: var(--fluent-radius-smooth);
  cursor: pointer;
  transition: all var(--fluent-transition-fast);
  color: var(--td-text-color-primary);
  position: relative;

  &:hover {
    background: var(--fluent-item-hover);
  }

  &.active {
    background: var(--fluent-item-selected);
    color: var(--td-brand-color);
    font-weight: 500;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--fluent-item-selected-border);
      border-radius: 0 2px 2px 0;
    }
  }
}

.menu-label {
  flex: 1;
  font-size: var(--td-font-size-body-medium);
}

.menu-divider {
  height: 1px;
  background: var(--fluent-border-subtle);
  margin: var(--td-size-3) 0;
}

.menu-section-title {
  font-size: var(--td-font-size-body-small);
  font-weight: 600;
  color: var(--td-text-color-secondary);
  padding: var(--td-size-2) var(--td-size-3);
  margin-top: var(--td-size-2);
}

.homebrew-content {
  flex: 1;
  padding: var(--td-size-6);
  overflow-y: auto;
  background: var(--td-bg-color-page);
}

.content-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-header {
  margin-bottom: var(--td-size-5);
}

.list-title {
  font: var(--td-font-title-medium);
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: var(--td-size-2);
}

.list-count {
  font: var(--td-font-body-medium);
  color: var(--td-text-color-secondary);
}

.list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--td-size-8);
}

.list-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--td-size-5);
}

.package-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--fluent-card-border);
  border-radius: var(--fluent-radius-card);
  padding: var(--td-size-5);
  box-shadow: var(--fluent-card-shadow);
  transition: all var(--fluent-transition-normal);
  display: flex;
  flex-direction: column;
  gap: var(--td-size-3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--fluent-card-shadow-hover);
    border-color: var(--td-brand-color-hover);
  }
}

.package-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--td-size-3);
}

.package-name {
  font: var(--td-font-subtitle-medium);
  color: var(--td-text-color-primary);
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.package-description {
  font: var(--td-font-body-small);
  color: var(--td-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

.package-info {
  display: flex;
  align-items: center;
  gap: var(--td-size-3);
}

.package-version {
  font: var(--td-font-body-small);
  color: var(--td-text-color-placeholder);
}

.package-status {
  display: flex;
  align-items: center;
  gap: var(--td-size-2);
}

.package-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--td-size-2);
  margin-top: auto;
  padding-top: var(--td-size-3);
  border-top: 1px solid var(--fluent-border-subtle);
}

:deep(.t-button) {
  border-radius: var(--fluent-radius-smooth);
  transition: all var(--fluent-transition-fast);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--fluent-elevation-1);
  }
}

:deep(.t-tag) {
  border-radius: var(--td-radius-small);
}
</style>
