<template>
  <t-card class="config-card" bordered>
    <t-form :data="props.config" label-align="top" @submit="handleSubmit">
      <t-form-item label="工作进程数" name="worker_processes">
        <t-input-number v-model="props.config.worker_processes" :min="1" :max="1024" style="width: 200px"/>
      </t-form-item>
      <t-form-item label="错误日志路径" name="error_log">
        <t-input v-model="props.config.error_log.path" placeholder="/var/log/nginx/error.log"/>
      </t-form-item>
      <t-form-item label="错误日志级别" name="error_log_level">
        <t-select v-model="props.config.error_log.level" :options="logLevelOptions" placeholder="选择日志级别"/>
      </t-form-item>
      <t-form-item label="PID 文件路径" name="pid">
        <t-input v-model="props.config.pid" placeholder="/var/run/nginx.pid"/>
      </t-form-item>
      <t-form-item label="事件配置">
        <t-card bordered class="sub-card">
          <t-form-item label="每个工作进程的最大连接数" name="worker_connections">
            <t-input-number v-model="props.config.events.worker_connections" :min="1" :max="65535"
                            style="width: 200px"/>
          </t-form-item>
          <t-form-item label="使用事件模型" name="use">
            <t-select v-model="props.config.events.use" :options="eventModelOptions" placeholder="选择事件模型"
                      clearable/>
          </t-form-item>
          <t-form-item label="是否启用多线程" name="multi_accept">
            <t-switch v-model="props.config.events.multi_accept"/>
          </t-form-item>
        </t-card>
      </t-form-item>
    </t-form>
  </t-card>
</template>

<script lang="ts" setup>
import {type NginxConfig} from '../types'

const props = defineProps<{
  config: NginxConfig
}>()

const emit = defineEmits(['submit'])

const logLevelOptions = [
  {label: 'debug', value: 'debug'},
  {label: 'info', value: 'info'},
  {label: 'notice', value: 'notice'},
  {label: 'warn', value: 'warn'},
  {label: 'error', value: 'error'},
  {label: 'crit', value: 'crit'},
  {label: 'alert', value: 'alert'},
  {label: 'emerg', value: 'emerg'}
]

const eventModelOptions = [
  {label: 'epoll', value: 'epoll'},
  {label: 'kqueue', value: 'kqueue'},
  {label: 'select', value: 'select'},
  {label: 'poll', value: 'poll'}
]

function handleSubmit() {
  emit('submit')
}
</script>

<style scoped lang="less">
.config-card {
  background: var(--fluent-card-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border: 1px solid var(--fluent-card-border);
  box-shadow: var(--fluent-card-shadow);
  border-radius: var(--fluent-radius-card);
  transition: all var(--fluent-transition-normal);

  &:hover {
    box-shadow: var(--fluent-card-shadow-hover);
  }

  .sub-card {
    background: var(--td-bg-color-secondarycontainer);
    border: 1px solid var(--td-border-level-2-color);
  }
}
</style>
