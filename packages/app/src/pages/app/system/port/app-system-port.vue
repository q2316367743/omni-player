<template>
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
      height="calc(100vh - 84px)"
      @sort-change="onSortChange"
    >
      <template #state="{ row }">
        {{ row.state || '-' }}
      </template>
      <template #pid="{ row }">
        {{ typeof row.pid === 'number' ? row.pid : '-' }}
      </template>
      <template #process="{ row }">
        <t-link
          v-if="typeof row.pid === 'number'"
          theme="primary"
          hover="color"
          @click.stop="openProcessDialog(row)"
        >
          {{ row.process || `PID ${row.pid}` }}
        </t-link>
        <span v-else>{{ row.process || '-' }}</span>
      </template>
    </t-table>

    <t-dialog
      v-model:visible="detailVisible"
      header="进程详情"
      width="720px"
      placement="center"
      :close-on-overlay-click="false"
    >
      <t-loading :loading="detailLoading">
        <div class="process-detail">
          <div class="process-detail__grid">
            <div class="process-detail__item">
              <div class="process-detail__key">协议</div>
              <div class="process-detail__value">{{ detailRow?.protocol || '-' }}</div>
            </div>
            <div class="process-detail__item">
              <div class="process-detail__key">地址</div>
              <div class="process-detail__value">{{ detailRow?.local_addr || '-' }}</div>
            </div>
            <div class="process-detail__item">
              <div class="process-detail__key">端口</div>
              <div class="process-detail__value">
                {{ typeof detailRow?.local_port === 'number' ? detailRow.local_port : '-' }}
              </div>
            </div>
            <div class="process-detail__item">
              <div class="process-detail__key">状态</div>
              <div class="process-detail__value">{{ detailRow?.state || '-' }}</div>
            </div>
            <div class="process-detail__item">
              <div class="process-detail__key">PID</div>
              <div class="process-detail__value">{{ typeof detailRow?.pid === 'number' ? detailRow.pid : '-' }}</div>
            </div>
            <div class="process-detail__item">
              <div class="process-detail__key">进程名</div>
              <div class="process-detail__value">{{ detail?.name || detailRow?.process || '-' }}</div>
            </div>
            <div class="process-detail__item">
              <div class="process-detail__key">PPID</div>
              <div class="process-detail__value">{{ typeof detail?.ppid === 'number' ? detail.ppid : '-' }}</div>
            </div>
            <div class="process-detail__item">
              <div class="process-detail__key">用户</div>
              <div class="process-detail__value">{{ detail?.user || '-' }}</div>
            </div>
            <div class="process-detail__item">
              <div class="process-detail__key">运行时长</div>
              <div class="process-detail__value">{{ detail?.elapsed || '-' }}</div>
            </div>
            <div class="process-detail__item process-detail__item--full">
              <div class="process-detail__key">命令行</div>
              <div class="process-detail__value process-detail__value--mono">{{ detail?.command || '-' }}</div>
            </div>
          </div>
        </div>
      </t-loading>
      <template #footer>
        <t-space size="small">
          <t-button variant="outline" @click="detailVisible = false">关闭</t-button>
          <t-button theme="danger" :loading="killing" :disabled="!canKill" @click="killSelected">
            关闭进程
          </t-button>
        </t-space>
      </template>
    </t-dialog>

    <t-back-top container=".t-table__content"/>
  </div>
</template>
<script lang="ts" setup>
import {invoke, isTauri} from "@tauri-apps/api/core";
import {RefreshIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

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

interface ProcessDetail {
  pid: number;
  ppid?: number | null;
  user?: string | null;
  elapsed?: string | null;
  name?: string | null;
  command?: string | null;
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

function normalizeSort(s: any): { sortBy?: string; descending?: boolean } {
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

const detailVisible = ref(false);
const detailRow = ref<PortUsageRow | null>(null);
const detailLoading = ref(false);
const detail = ref<ProcessDetail | null>(null);
const killing = ref(false);

const canKill = computed(() => tauri && typeof detailRow.value?.pid === 'number');

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

async function openProcessDialog(row: PortUsageRow) {
  detailRow.value = row;
  detail.value = null;
  detailVisible.value = true;
  if (!tauri) return;
  if (typeof row.pid !== 'number') return;
  detailLoading.value = true;
  try {
    detail.value = await invoke<ProcessDetail>('system_process_detail', {pid: row.pid});
  } catch (e) {
    console.error(e);
    MessageUtil.error('查询进程详情失败', e);
  } finally {
    detailLoading.value = false;
  }
}

async function killSelected() {
  if (!tauri) return;
  const row = detailRow.value;
  if (!row || typeof row.pid !== 'number') return;
  try {
    await MessageBoxUtil.confirm(`确定要关闭进程 ${row.process || ''} (PID ${row.pid}) 吗？`, '关闭进程');
  } catch {
    return;
  }
  killing.value = true;
  try {
    await invoke('system_process_kill', {pid: row.pid});
    MessageUtil.success('进程已关闭');
    detailVisible.value = false;
    await refresh();
  } catch (e) {
    console.error(e);
    MessageUtil.error('关闭进程失败', e);
  } finally {
    killing.value = false;
  }
}

watch(detailVisible, v => {
  if (!v) {
    detailRow.value = null;
    detail.value = null;
    detailLoading.value = false;
    killing.value = false;
  }
});

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

.process-detail {
  padding: 4px 0;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
  }

  &__item {
    min-width: 0;
  }

  &__item--full {
    grid-column: 1 / -1;
  }

  &__key {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin-bottom: 4px;
    user-select: none;
  }

  &__value {
    font-size: 13px;
    color: var(--td-text-color-primary);
    word-break: break-all;
  }

  &__value--mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }
}
</style>
