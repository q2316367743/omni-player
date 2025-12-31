<template>
  <app-tool-layout title="系统工具 / 端口扫描">
    <div class="port-tool">
      <div class="toolbar">
        <t-space size="small">
          <t-button theme="primary" :loading="loading" @click="refresh">
            <template #icon>
              <refresh-icon/>
            </template>
            刷新
          </t-button>
        </t-space>
        <div class="meta">
          <span class="meta-item">共 {{ rows.length }} 条</span>
          <span v-if="lastUpdated" class="meta-item">上次更新：{{ formatTime(lastUpdated) }}</span>
        </div>
      </div>

      <t-alert
        v-if="!tauri"
        theme="warning"
        title="当前环境不支持端口占用查询"
        message="该功能依赖 Tauri 后端命令，请在桌面端使用。"
        class="mb-12px"
      />

      <t-table
        v-else
        row-key="key"
        :data="displayRows"
        :columns="columns"
        bordered
        :sort="sort"
        height="calc(100vh - 136px)"
        @sort-change="onSortChange"
      >
        <template #state="{ row }">
          {{ row.state || '-' }}
        </template>
        <template #pid="{ row }">
          {{ typeof row.pid === 'number' ? row.pid : '-' }}
        </template>
        <template #process="{ row }">
          {{ row.process || '-' }}
        </template>
      </t-table>

      <t-back-top container=".t-table__content" />
    </div>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import {invoke, isTauri} from "@tauri-apps/api/core";
import {RefreshIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";

interface PortUsage {
  protocol: string;
  local_addr: string;
  local_port: number;
  state?: string | null;
  pid?: number | null;
  process?: string | null;
}

interface PortUsageRow extends PortUsage {
  key: string;
}

const tauri = isTauri();

const loading = ref(false);
const rows = ref<PortUsageRow[]>([]);
const lastUpdated = ref<number>(0);
const sort = ref<any>({
  sortBy: 'local_port',
  descending: false
});

const columns = computed(() => ([
  {
    title: '协议',
    colKey: 'protocol',
    sorter: true,
    sortType: 'all' as const,
    width: 90
  },
  {
    title: '地址',
    colKey: 'local_addr',
    sorter: true,
    sortType: 'all' as const,
    minWidth: 140
  },
  {
    title: '端口',
    colKey: 'local_port',
    sorter: true,
    sortType: 'all' as const,
    width: 110
  },
  {
    title: '状态',
    colKey: 'state',
    sorter: true,
    sortType: 'all' as const,
    width: 120
  },
  {
    title: 'PID',
    colKey: 'pid',
    sorter: true,
    sortType: 'all' as const,
    width: 110
  },
  {
    title: '进程',
    colKey: 'process',
    sorter: true,
    sortType: 'all' as const,
    minWidth: 200
  },
]));

function normalizeSort(s: any): {sortBy?: string; descending?: boolean} {
  if (!s) return {};
  if (Array.isArray(s)) return s[0] || {};
  return s;
}

const displayRows = computed(() => {
  const {sortBy, descending} = normalizeSort(sort.value);
  if (!sortBy) return rows.value;
  const list = [...rows.value];
  list.sort((a, b) => {
    const av: any = (a as any)[sortBy];
    const bv: any = (b as any)[sortBy];

    if (typeof av === 'number' && typeof bv === 'number') {
      return av - bv;
    }
    const as = av == null ? '' : String(av);
    const bs = bv == null ? '' : String(bv);
    return as.localeCompare(bs, 'zh-Hans-CN', {numeric: true, sensitivity: 'base'});
  });
  return descending ? list.reverse() : list;
});

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

async function refresh() {
  if (!tauri) return;
  loading.value = true;
  try {
    const data = await invoke<PortUsage[]>('system_port_list');
    rows.value = (data || []).map(e => ({
      ...e,
      key: `${e.protocol}-${e.local_addr}-${e.local_port}-${e.pid ?? ''}`
    }));
    lastUpdated.value = Date.now();
  } catch (e) {
    console.error(e);
    MessageUtil.error('查询端口占用失败', e);
  } finally {
    loading.value = false;
  }
}

function onSortChange(s: any) {
  sort.value = s;
}

useTimeoutFn(refresh, 3000, {immediateCallback: true})
</script>
<style scoped lang="less">
.port-tool {
  padding: 16px;
  box-sizing: border-box;

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 12px;

    .meta {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--td-text-color-secondary);
      font-size: 12px;
      user-select: none;
    }
  }
}
</style>
