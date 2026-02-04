<template>
  <div class="p-8px overflow-auto">
    <t-card>
      <template #actions>
        <t-space>
          <t-button theme="default" variant="outline" @click="handleViewToolCalls">
            <template #icon>
              <view-list-icon />
            </template>
            查看工具调用
          </t-button>
          <t-button theme="primary" @click="handleAdd">
            <template #icon>
              <add-icon/>
            </template>
            新增 MCP
          </t-button>
        </t-space>
      </template>

      <t-table
        :data="mcps"
        :columns="columns"
        :loading="loading"
        bordered
        row-key="id"
        size="small"
      >
        <template #is_enabled="{ row }">
          <t-switch
            :model-value="row.is_enabled"
            :loading="row.loading"
            @change="(val) => handleToggleEnable(row, val as boolean)"
          />
        </template>

        <template #args="{ row }">
          <t-tag v-for="(arg, idx) in row.args.slice(0, 3)" :key="idx" size="small" theme="default">
            {{ arg }}
          </t-tag>
          <t-tag v-if="row.args.length > 3" size="small" theme="default">
            +{{ row.args.length - 3 }}
          </t-tag>
        </template>

        <template #env="{ row }">
          <t-tag v-for="(val, key) in Object.entries(row.env).slice(0, 2)" :key="key" size="small" theme="primary">
            {{ key }}={{ val }}
          </t-tag>
          <t-tag v-if="Object.keys(row.env).length > 2" size="small" theme="primary">
            +{{ Object.keys(row.env).length - 2 }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-space>
            <t-button
              size="small"
              variant="text"
              theme="primary"
              @click="handleEdit(row)"
            >
              编辑
            </t-button>
            <t-popconfirm
              content="确定要删除此 MCP 配置吗？"
              @confirm="handleDelete(row)"
            >
              <t-button
                size="small"
                variant="text"
                theme="danger"
              >
                删除
              </t-button>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <t-drawer
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑 MCP' : '新增 MCP'"
      size="700px"
      :confirm-btn="{ content: '确定', loading: submitting }"
      @confirm="handleSubmit"
    >
      <t-collapse :default-expand-all="false">
        <t-collapse-panel header="JSON 快速填充" value="json">
          <t-alert theme="info" message="粘贴 JSON 配置，点击解析按钮自动填充表单" class="mb-12px">
            <template #default>
              <div class="json-tips">
                <p>支持两种格式：</p>
                <pre class="json-example">格式1 - 完整配置：
{
  "label": "标签",
  "name": "名称",
  "description": "描述",
  "command": "npx",
  "args": ["-y", "@memtensor/memos-api-mcp@latest"],
  "env": {
    "MEMOS_API_KEY": "xxxxxx"
  }
}

格式2 - mcpServers 格式：
{
  "mcpServers": {
    "memos-api-mcp": {
      "args": ["-y", "@memtensor/memos-api-mcp@latest"],
      "command": "npx",
      "env": {
        "MEMOS_API_KEY": "xxxxxx"
      }
    }
  }
}</pre>
              </div>
            </template>
          </t-alert>
          <t-textarea
            v-model="jsonInput"
            :autosize="{ minRows: 8, maxRows: 12 }"
            placeholder="请粘贴 JSON 配置"
            class="mb-12px"
          />
          <t-button theme="primary" @click="handleParseJson">
            <template #icon>
              <check-icon />
            </template>
            解析 JSON
          </t-button>
        </t-collapse-panel>
      </t-collapse>

      <t-divider />

      <t-form
        ref="formRef"
        :data="formData"
        :rules="rules"
        label-align="top"
        @submit="handleSubmit"
      >
        <t-form-item label="标签" name="label">
          <t-input v-model="formData.label" placeholder="请输入标签名称" />
        </t-form-item>

        <t-form-item label="名称" name="name">
          <t-input v-model="formData.name" placeholder="请输入 MCP 名称" />
        </t-form-item>

        <t-form-item label="描述" name="description">
          <t-textarea
            v-model="formData.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入描述"
          />
        </t-form-item>

        <t-form-item label="命令" name="command">
          <t-input v-model="formData.command" placeholder="请输入命令，如: npx" />
        </t-form-item>

        <t-form-item label="参数" name="args">
          <t-tag-input
            v-model="formData.args"
            placeholder="输入参数后按回车添加"
            clearable
          />
        </t-form-item>

        <t-form-item label="环境变量" name="env">
          <div class="env-inputs">
            <div
              v-for="(item, index) in envList"
              :key="index"
              class="env-input-row"
            >
              <t-input
                v-model="item.key"
                placeholder="变量名"
                style="width: 45%"
              />
              <span class="env-separator">=</span>
              <t-input
                v-model="item.value"
                placeholder="变量值"
                style="width: 45%"
              />
              <t-button
                size="small"
                variant="text"
                theme="danger"
                @click="removeEnv(index)"
              >
                <template #icon>
                  <close-icon />
                </template>
              </t-button>
            </div>
            <t-button size="small" variant="dashed" @click="addEnv">
              <template #icon>
                <add-icon />
              </template>
              添加环境变量
            </t-button>
          </div>
        </t-form-item>

        <t-form-item label="启用状态" name="is_enabled">
          <t-switch v-model="formData.is_enabled" />
        </t-form-item>
      </t-form>
    </t-drawer>

    <t-drawer
      v-model:visible="toolCallsDrawerVisible"
      header="MCP 工具调用"
      size="large"
      :footer="false"
    >
      <div class="tool-calls-container">
        <t-loading :loading="toolCallsLoading" size="large">
          <div v-if="!toolCallsLoading && toolCalls.length === 0" class="empty-state">
            <t-empty description="暂无工具调用数据" />
          </div>
          <div v-else class="tool-calls-list">
            <div
              v-for="(tool, index) in toolCalls"
              :key="index"
              class="tool-call-item"
            >
              <div class="tool-call-header">
                <t-tag size="small" theme="primary">{{ tool.id }}</t-tag>
                <span class="tool-name">{{ tool.name }}</span>
              </div>
              <div class="tool-call-description">{{ tool.description }}</div>
              
              <div v-if="tool.required && tool.required.length > 0" class="tool-call-section">
                <div class="section-title">必要参数</div>
                <t-tag v-for="param in tool.required" :key="param" size="small" theme="warning">
                  {{ param }}
                </t-tag>
              </div>

              <div v-if="tool.parameters && Object.keys(tool.parameters).length > 0" class="tool-call-section">
                <div class="section-title">参数定义</div>
                <t-collapse>
                  <t-collapse-panel
                    v-for="(schema, key) in tool.parameters"
                    :key="key"
                    :header="key"
                    :value="key"
                  >
                    <MonacoEditor
                      :model-value="formatJson(schema)"
                      language="json"
                      :readonly="true"
                      height="200px"
                    />
                  </t-collapse-panel>
                </t-collapse>
              </div>

              <div v-if="tool.requestBody && Object.keys(tool.requestBody).length > 0" class="tool-call-section">
                <div class="section-title">响应体定义</div>
                <t-collapse>
                  <t-collapse-panel
                    v-for="(schema, key) in tool.requestBody"
                    :key="`response-${key}`"
                    :header="key"
                    :value="`response-${key}`"
                  >
                    <MonacoEditor
                      :model-value="formatJson(schema)"
                      language="json"
                      :readonly="true"
                      height="200px"
                    />
                  </t-collapse-panel>
                </t-collapse>
              </div>
            </div>
          </div>
        </t-loading>
      </div>
    </t-drawer>
  </div>
</template>

<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useMcpSettingStore} from "@/store/McpSettingStore.ts";
import type {McpSettingView, McpSettingViewCore} from "@/entity/setting";
import {AddIcon, CheckIcon, CloseIcon, ViewListIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {FormInstanceFunctions, FormRule} from "tdesign-vue-next";
import {getToolCalls, type McpToolCall} from "@tauri-apps/plugin-mcp";
import MonacoEditor from "@/components/common/MonacoEditor.vue";

const mcpSettingStore = useMcpSettingStore();
const {mcps} = storeToRefs(mcpSettingStore);

const loading = ref(false);
const dialogVisible = ref(false);
const toolCallsDrawerVisible = ref(false);
const toolCallsLoading = ref(false);
const toolCalls = ref<McpToolCall[]>([]);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstanceFunctions>();
const currentEditId = ref<string>();
const jsonInput = ref('');

const formData = ref<McpSettingViewCore>({
  label: '',
  name: '',
  description: '',
  args: [],
  command: '',
  env: {},
  is_enabled: true
});

const envList = ref<Array<{key: string; value: string}>>([]);

const rules: Record<string, FormRule[]> = {
  label: [{required: true, message: '请输入标签名称'}],
  name: [{required: true, message: '请输入 MCP 名称'}],
  command: [{required: true, message: '请输入命令'}]
};

function formatJson(data: any): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return JSON.stringify(data);
  }
}

const columns = computed(() => [
  {
    title: '标签',
    colKey: 'label',
    width: 120
  },
  {
    title: '名称',
    colKey: 'name',
    width: 150
  },
  {
    title: '描述',
    colKey: 'description',
    ellipsis: true
  },
  {
    title: '启用',
    colKey: 'is_enabled',
    width: 80,
    align: 'center' as const
  },
  {
    title: '操作',
    colKey: 'operation',
    width: 140,
    fixed: 'right' as const
  }
]);

async function fetchList() {
  loading.value = true;
  try {
    await mcpSettingStore.fetchMcps();
  } catch (e) {
    MessageUtil.error('加载 MCP 列表失败', e);
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  isEdit.value = false;
  currentEditId.value = undefined;
  formData.value = {
    label: '',
    name: '',
    description: '',
    args: [],
    command: '',
    env: {},
    is_enabled: true
  };
  envList.value = [];
  jsonInput.value = '';
  dialogVisible.value = true;
}

function handleEdit(row: McpSettingView) {
  isEdit.value = true;
  currentEditId.value = row.id;
  formData.value = {
    label: row.label,
    name: row.name,
    description: row.description,
    args: [...row.args],
    command: row.command,
    env: {...row.env},
    is_enabled: row.is_enabled
  };
  envList.value = Object.entries(row.env).map(([key, value]) => ({key, value}));
  jsonInput.value = '';
  dialogVisible.value = true;
}

function addEnv() {
  envList.value.push({key: '', value: ''});
}

function removeEnv(index: number) {
  envList.value.splice(index, 1);
}

function handleParseJson() {
  try {
    const data: any = JSON.parse(jsonInput.value);
    
    if (data.mcpServers && typeof data.mcpServers === 'object') {
      const entries: any[] = Object.entries(data.mcpServers);
      
      if (entries.length > 0) {
        const [name, config] = entries[0];
        formData.value.name = name;
        formData.value.label = name;
        formData.value.command = config?.command || '';
        formData.value.args = config?.args || [];
        formData.value.env = config?.env || {};
        envList.value = Object.entries(config?.env || {}).map(([key, value]: [string, any]) => ({key, value: String(value)}));
        MessageUtil.success('解析成功');
      } else {
        MessageUtil.error('JSON 中没有找到 MCP 配置');
      }
    } else if (data.command || data.args || data.env) {
      formData.value.label = data.label || data.name || '';
      formData.value.name = data.name || data.label || '';
      formData.value.description = data.description || '';
      formData.value.command = data.command || '';
      formData.value.args = data.args || [];
      formData.value.env = data.env || {};
      envList.value = Object.entries(data.env || {}).map(([key, value]: [string, any]) => ({key, value: String(value)}));
      MessageUtil.success('解析成功');
    } else {
      MessageUtil.error('JSON 格式不正确，请参考示例');
    }
  } catch (e) {
    MessageUtil.error('JSON 解析失败', e);
  }
}

async function handleViewToolCalls() {
  toolCallsDrawerVisible.value = true;
  toolCallsLoading.value = true;
  try {
    toolCalls.value = await getToolCalls();
  } catch (e) {
    MessageUtil.error('加载工具调用失败', e);
  } finally {
    toolCallsLoading.value = false;
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate();
  if (valid !== true) return;

  submitting.value = true;
  try {
    const env: Record<string, string> = {};
    envList.value.forEach(({key, value}) => {
      if (key && value) {
        env[key] = value;
      }
    });

    const data: McpSettingViewCore = {
      ...formData.value,
      env
    };

    if (isEdit.value && currentEditId.value) {
      await mcpSettingStore.updateMcp(currentEditId.value, data);
      MessageUtil.success('更新成功');
    } else {
      await mcpSettingStore.addMcp(data);
      MessageUtil.success('添加成功');
    }

    dialogVisible.value = false;
  } catch (e) {
    MessageUtil.error(isEdit.value ? '更新失败' : '添加失败', e);
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: McpSettingView) {
  try {
    await mcpSettingStore.deleteMcp(row.id);
    MessageUtil.success('删除成功');
  } catch (e) {
    MessageUtil.error('删除失败', e);
  }
}

async function handleToggleEnable(row: McpSettingView, enabled: boolean) {
  row.loading = true;
  try {
    await mcpSettingStore.updateMcp(row.id, {is_enabled: enabled});
    MessageUtil.success(enabled ? '已启用' : '已禁用');
  } catch (e) {
    MessageUtil.error('操作失败', e);
    row.is_enabled = !enabled;
  } finally {
    row.loading = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped lang="less">
.env-inputs {
  width: 100%;

  .env-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .env-separator {
      color: var(--td-text-color-secondary);
    }
  }
}

.json-tips {
  p {
    margin: 0 0 8px 0;
    font-weight: 500;
  }

  .json-example {
    margin: 0;
    padding: 12px;
    background: var(--td-bg-color-container);
    border-radius: 4px;
    font-size: 12px;
    color: var(--td-text-color-secondary);
    overflow-x: auto;
  }
}

.tool-calls-container {
  .empty-state {
    padding: 40px 0;
  }

  .tool-calls-list {
    .tool-call-item {
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid var(--td-component-border);
      border-radius: 8px;
      background: var(--td-bg-color-container);

      &:last-child {
        margin-bottom: 0;
      }

      .tool-call-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .tool-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--td-text-color-primary);
        }
      }

      .tool-call-description {
        margin-bottom: 16px;
        color: var(--td-text-color-secondary);
        line-height: 1.6;
      }

      .tool-call-section {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--td-text-color-primary);
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>
