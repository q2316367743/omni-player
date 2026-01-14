<template>
  <t-card class="config-card" bordered>
    <t-form :data="props.config" label-align="top">
      <t-form-item label="MIME 类型文件" name="mime_types">
        <t-input v-model="props.config.http.mime_types" placeholder="/etc/nginx/mime.types"/>
      </t-form-item>
      <t-form-item label="默认类型" name="default_type">
        <t-input v-model="props.config.http.default_type" placeholder="application/octet-stream"/>
      </t-form-item>
      <t-form-item label="发送文件" name="sendfile">
        <t-switch v-model="props.config.http.sendfile"/>
      </t-form-item>
      <t-form-item label="TCP 推送" name="tcp_nopush">
        <t-switch v-model="props.config.http.tcp_nopush"/>
      </t-form-item>
      <t-form-item label="TCP 无延迟" name="tcp_nodelay">
        <t-switch v-model="props.config.http.tcp_nodelay"/>
      </t-form-item>
      <t-form-item label="保持连接超时(秒)" name="keepalive_timeout">
        <t-input-number v-model="props.config.http.keepalive_timeout" :min="0" :max="3600" style="width: 200px"/>
      </t-form-item>
      <t-form-item label="Gzip 压缩">
        <t-card bordered class="sub-card">
          <t-form-item label="启用 Gzip" name="gzip">
            <t-switch v-model="props.config.http.gzip"/>
          </t-form-item>
          <t-form-item label="Gzip 版本" name="gzip_http_version">
            <t-select v-model="props.config.http.gzip_http_version" :options="httpVersionOptions"
                      placeholder="选择 HTTP 版本"/>
          </t-form-item>
          <t-form-item label="压缩级别(1-9)" name="gzip_comp_level">
            <t-input-number v-model="props.config.http.gzip_comp_level" :min="1" :max="9" style="width: 200px"/>
          </t-form-item>
          <t-form-item label="压缩类型" name="gzip_types">
            <t-textarea v-model="props.config.http.gzip_types" placeholder="text/plain text/css application/json"
                        :autosize="{ minRows: 2, maxRows: 4 }"/>
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

const httpVersionOptions = [
  {label: '1.0', value: '1.0'},
  {label: '1.1', value: '1.1'}
]
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
