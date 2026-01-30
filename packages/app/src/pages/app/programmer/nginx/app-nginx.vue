<template>
  <app-tool-layout title="nginx 可视化">
    <template #action>
      <t-space>
        <t-button theme="default" variant="outline" @click="handleImport">
          <template #icon><t-icon name="upload" /></template>
          导入配置
        </t-button>
        <t-button theme="primary" @click="handleExport">
          <template #icon><t-icon name="download" /></template>
          导出配置
        </t-button>
      </t-space>
    </template>

    <div class="nginx-visualizer">
      <t-tabs v-model="activeTab" placement="top" theme="card">
        <t-tab-panel value="basic" label="基础配置">
          <BasicConfig :config="nginxConfig" @submit="handleSubmit" />
        </t-tab-panel>

        <t-tab-panel value="http" label="HTTP 配置">
          <HttpConfig :config="nginxConfig" />
        </t-tab-panel>

        <t-tab-panel value="server" label="服务器配置">
          <ServerConfig 
            :config="nginxConfig" 
            @add-server="handleAddServer"
            @remove-server="handleRemoveServer"
            @update-server-name="handleUpdateServerName"
            @add-location="handleAddLocation"
            @remove-location="handleRemoveLocation"
          />
        </t-tab-panel>

        <t-tab-panel value="upstream" label="上游服务器">
          <UpstreamConfig 
            :config="nginxConfig" 
            @add-upstream="handleAddUpstream"
            @remove-upstream="handleRemoveUpstream"
            @add-upstream-server="handleAddUpstreamServer"
            @remove-upstream-server="handleRemoveUpstreamServer"
          />
        </t-tab-panel>

        <t-tab-panel value="preview" label="配置预览">
          <ConfigPreview :config="generatedConfig" />
        </t-tab-panel>
      </t-tabs>
    </div>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next'
import { type NginxConfig } from './types'
import BasicConfig from './components/BasicConfig.vue'
import HttpConfig from './components/HttpConfig.vue'
import ServerConfig from './components/ServerConfig.vue'
import UpstreamConfig from './components/UpstreamConfig.vue'
import ConfigPreview from './components/ConfigPreview.vue'
import { generateNginxConfig } from './func/config-generator'
import { previewLogFormat } from './func/log-preview'
import { importNginxConfig, exportNginxConfig } from './func/file-handler'
import {
  addServer,
  removeServer,
  updateServerName,
  addLocation,
  removeLocation,
  addUpstream,
  removeUpstream,
  addUpstreamServer,
  removeUpstreamServer
} from './func/config-manager'

const activeTab = ref('basic')

const nginxConfig = reactive<NginxConfig>({
  worker_processes: 1,
  error_log: {
    path: '/var/log/nginx/error.log',
    level: 'error'
  },
  pid: '/var/run/nginx.pid',
  events: {
    worker_connections: 1024,
    use: '',
    multi_accept: false
  },
  http: {
    mime_types: '/etc/nginx/mime.types',
    default_type: 'application/octet-stream',
    sendfile: true,
    tcp_nopush: true,
    tcp_nodelay: true,
    keepalive_timeout: 65,
    gzip: true,
    gzip_http_version: '1.1',
    gzip_comp_level: 6,
    gzip_types: 'text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript',
    servers: [],
    upstreams: []
  }
})

const generatedConfig = computed(() => {
  return generateNginxConfig(nginxConfig)
})

function handleSubmit() {
  MessagePlugin.success('配置已保存')
}

function handleAddServer() {
  addServer(nginxConfig)
}

function handleRemoveServer(index: number) {
  removeServer(nginxConfig, index)
}

function handleUpdateServerName(index: number, value: string) {
  updateServerName(nginxConfig, index, value)
}

function handleAddLocation(serverIndex: number) {
  addLocation(nginxConfig, serverIndex)
}

function handleRemoveLocation(serverIndex: number, locationIndex: number) {
  removeLocation(nginxConfig, serverIndex, locationIndex)
}

function handleAddUpstream() {
  addUpstream(nginxConfig)
}

function handleRemoveUpstream(index: number) {
  removeUpstream(nginxConfig, index)
}

function handleAddUpstreamServer(upstreamIndex: number) {
  addUpstreamServer(nginxConfig, upstreamIndex)
}

function handleRemoveUpstreamServer(upstreamIndex: number, serverIndex: number) {
  removeUpstreamServer(nginxConfig, upstreamIndex, serverIndex)
}

function handleImport() {
  importNginxConfig(nginxConfig)
}

function handleExport() {
  exportNginxConfig(generatedConfig.value)
}

watch(() => nginxConfig.http.servers, (servers) => {
  servers.forEach((server) => {
    if (server.access_log.custom_format) {
      previewLogFormat(server)
    }
  })
}, { deep: true })
</script>

<style scoped lang="less">
.nginx-visualizer {
  padding: var(--td-size-6);
  background: var(--td-bg-color-page);
  min-height: calc(100vh - 120px);
}

:deep(.t-tabs__nav-item) {
  transition: all var(--fluent-transition-fast);
}

:deep(.t-tabs__nav-item.t-is-active) {
  color: var(--td-brand-color);
  font-weight: 600;
}

:deep(.t-form__item) {
  margin-bottom: var(--td-size-5);
}

:deep(.t-input),
:deep(.t-textarea__inner) {
  border-radius: var(--td-radius-medium);
  transition: all var(--fluent-transition-fast);

  &:hover {
    border-color: var(--td-brand-color-hover);
  }

  &:focus {
    border-color: var(--td-brand-color);
    box-shadow: var(--fluent-focus-ring);
  }
}

:deep(.t-button) {
  border-radius: var(--td-radius-medium);
  transition: all var(--fluent-transition-fast);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--fluent-elevation-2);
  }
}

:deep(.t-switch) {
  transition: all var(--fluent-transition-fast);
}

:deep(.t-collapse-panel__content) {
  padding: var(--td-size-5);
}

:deep(.t-table) {
  border-radius: var(--td-radius-medium);
  overflow: hidden;
}
</style>
