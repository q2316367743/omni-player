<template>
  <div class="resource-section">
    <div class="resource-header">
      <h3 class="resource-title">
        <internet-icon class="title-icon"/>
        网络资源
      </h3>
      <div class="flex gap-4px">
        <t-tooltip content="导入">
          <t-button theme="primary" variant="text" shape="square"
                    @click="importNetwork()">
            <template #icon>
              <file-import-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-tooltip content="导出">
          <t-button theme="primary" variant="text" shape="square"
                    @click="exportNetwork()">
            <template #icon>
              <file-export-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-tooltip content="聚合搜索">
          <t-button theme="primary" variant="text" shape="square"
                    @click="openSearchModelWrap()">
            <template #icon>
              <search-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-button theme="primary" variant="text" shape="square"
                  @click="openNetworkServerEdit()">
          <template #icon>
            <add-icon/>
          </template>
        </t-button>
      </div>
    </div>
    <div class="resource-grid">
      <template v-for="group in groupedNetworks" :key="group.name">
        <div v-if="group.name" class="group-folder" @click="toggleGroup(group.name)">
          <div class="folder-header">
            <div class="folder-icon">
              <chevron-right-icon :class="{ 'expanded': expandedGroups.has(group.name) }"/>
            </div>
            <div class="folder-info">
              <div class="folder-name">{{ group.name }}</div>
              <div class="folder-count">{{ group.items.length }} 项</div>
            </div>
          </div>
        </div>
        <template v-else>
          <div v-for="network in group.items" :key="network.id" class="resource-card"
               @click="jumpNetwork(network.id)"
               @contextmenu="handleNetworkContextmenu(network, $event)">
            <div class="resource-icon network">
              <internet-icon/>
            </div>
            <div class="resource-info">
              <div class="resource-name">{{ network.name }}</div>
              <div class="resource-type">未分组</div>
            </div>
          </div>
        </template>
        <transition name="folder-expand">
          <div v-if="group.name && expandedGroups.has(group.name)" class="folder-expanded-content">
            <div class="folder-grid">
              <div v-for="network in group.items" :key="network.id" class="resource-card"
                   @click.stop="jumpNetwork(network.id)"
                   @contextmenu="handleNetworkContextmenu(network, $event)">
                <div class="resource-icon network">
                  <internet-icon/>
                </div>
                <div class="resource-info">
                  <div class="resource-name">{{ network.name }}</div>
                  <div class="resource-type">{{ network.group }}</div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </template>
      <div v-if="networks.length === 0" class="empty-state">
        <div class="empty-icon">
          <internet-icon/>
        </div>
        <div class="empty-text">暂无网络资源</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useNetworkServerStore} from "@/store";
import {InternetIcon, AddIcon, SearchIcon, FileImportIcon, FileExportIcon, ChevronRightIcon} from "tdesign-icons-vue-next";
import type {NetworkServer} from "@/entity/NetworkServer.ts";
import {openNetworkContextmenu, openNetworkServerEdit} from "@/pages/home/default/func/NetworkServerEdit.tsx";
import {openSearchModel} from "@/util/model/SearchUtil.tsx";
import {exportNetwork, importNetwork} from "@/pages/home/default/func/NetworkExtra.tsx";

const router = useRouter();

const expandedGroups = ref<Set<string>>(new Set());

const networks = computed(() => {
  return [...useNetworkServerStore().servers].sort((a, b) => {
    const groupDiff = (a.group || '').localeCompare(b.group || '');
    if (groupDiff !== 0) return groupDiff;
    const diff = a.sequence - b.sequence;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
});

const groupedNetworks = computed(() => {
  const groups = new Map<string, NetworkServer[]>();
  
  networks.value.forEach(network => {
    const groupName = network.group || '';
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)!.push(network);
  });
  
  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    items
  })).sort((a, b) => {
    if (!a.name) return 1;
    if (!b.name) return -1;
    return a.name.localeCompare(b.name);
  });
});

const toggleGroup = (groupName: string) => {
  const newSet = new Set(expandedGroups.value);
  if (newSet.has(groupName)) {
    newSet.delete(groupName);
  } else {
    newSet.add(groupName);
  }
  expandedGroups.value = newSet;
};

const jumpNetwork = (id: string) => router.push(`/network/${id}/home`);

const handleNetworkContextmenu = (network: NetworkServer, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  openNetworkContextmenu(network, e);
};

const openSearchModelWrap = () => {
  openSearchModel().then(keyword => {
    if (!keyword) return;
    router.push({
      path: '/network/aggregation',
      query: {
        keyword
      }
    })

  })
}
</script>

<style scoped lang="less">
@import "../home-index.less";

.group-folder {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  padding: var(--td-size-5);
  display: flex;
  align-items: center;
  gap: var(--td-size-4);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--fluent-elevation-1);
  border: 1px solid var(--fluent-border-subtle);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--fluent-reveal-bg);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--fluent-elevation-2);
    border-color: var(--td-brand-color);

    &::before {
      opacity: 1;
    }

    .folder-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: var(--fluent-elevation-1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--fluent-focus-ring);
  }

  .folder-header {
    display: flex;
    align-items: center;
    gap: var(--td-size-4);
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;

    .folder-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--td-radius-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--td-brand-color-4) 0%, var(--td-brand-color-5) 100%);
      color: var(--td-text-color-anti);
      flex-shrink: 0;
      transition: transform 0.25s ease;
      position: relative;
      z-index: 1;

      :deep(.t-icon) {
        font-size: 22px;
        transition: transform var(--fluent-transition-normal);
        &.expanded {
            transform: rotate(90deg);
        }
      }

    }

    .folder-info {
      flex: 1;
      min-width: 0;
      position: relative;
      z-index: 1;

      .folder-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--td-text-color-primary);
        margin-bottom: var(--td-size-1);
        letter-spacing: -0.2px;
      }

      .folder-count {
        font-size: 13px;
        color: var(--td-text-color-secondary);
        font-weight: 400;
      }
    }
  }
}

.folder-expanded-content {
  grid-column: 1 / -1;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--fluent-border-subtle);
  margin-bottom: var(--td-size-3);
  overflow: hidden;
  box-shadow: var(--fluent-elevation-1);

  .folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--td-size-4);
    padding: var(--td-size-4);
  }
}

.folder-expand-enter-active,
.folder-expand-leave-active {
  transition: all var(--fluent-transition-normal);
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

.folder-expand-enter-from,
.folder-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.folder-expand-enter-to,
.folder-expand-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}
</style>
