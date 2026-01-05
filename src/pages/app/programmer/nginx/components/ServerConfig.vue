<template>
  <t-card class="config-card" bordered>
    <div class="server-list">
      <div class="server-header">
        <h3>服务器列表</h3>
        <t-button theme="primary" size="small" @click="addServer">
          <template #icon><t-icon name="add" /></template>
          添加服务器
        </t-button>
      </div>
      <t-collapse v-model="activeServerKeys">
        <t-collapse-panel v-for="(server, index) in config.http.servers" :key="index" :value="index.toString()">
          <template #header>
            <div class="server-panel-header">
              <span>{{ server.server_name.join(', ') || `服务器 ${index + 1}` }}</span>
              <t-button theme="danger" variant="text" size="small" @click.stop="removeServer(index)">
                <template #icon><t-icon name="delete" /></template>
              </t-button>
            </div>
          </template>
          <t-form :data="server" label-align="top">
            <t-form-item label="监听端口" name="listen">
              <t-input v-model="server.listen" placeholder="80" />
            </t-form-item>
            <t-form-item label="服务器名称" name="server_name">
              <t-input v-model="server.server_name_str" placeholder="example.com www.example.com" @change="(val: string | number) => updateServerName(index, String(val))" />
            </t-form-item>
            <t-form-item label="根目录" name="root">
              <t-input v-model="server.root" placeholder="/var/www/html" />
            </t-form-item>
            <t-form-item label="索引文件" name="index">
              <t-input v-model="server.index" placeholder="index.html index.htm" />
            </t-form-item>
            <t-form-item label="访问日志配置">
              <t-card bordered class="sub-card">
                <t-form-item label="日志路径" name="access_log_path">
                  <t-input v-model="server.access_log.path" placeholder="/var/log/nginx/access.log" />
                </t-form-item>
                <t-form-item label="日志格式" name="access_log_format">
                  <t-input v-model="server.access_log.format" placeholder="combined" />
                </t-form-item>
                <t-form-item label="自定义日志模板" name="custom_log_format">
                  <t-input v-model="server.access_log.custom_format" placeholder='$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent' @input="previewLogFormat(index)" />
                  <template #tips>
                    <div v-if="server.access_log.preview" class="log-preview">
                      <strong>示例日志：</strong>
                      <code>{{ server.access_log.preview }}</code>
                    </div>
                  </template>
                </t-form-item>
              </t-card>
            </t-form-item>
            <t-divider>位置配置</t-divider>
            <div class="location-list">
              <div class="location-header">
                <span>Location 列表</span>
                <t-button theme="primary" variant="outline" size="small" @click="addLocation(index)">
                  <template #icon><t-icon name="add" /></template>
                  添加 Location
                </t-button>
              </div>
              <t-collapse v-model="activeLocationKeys">
                <t-collapse-panel v-for="(location, locIndex) in server.locations" :key="locIndex" :value="`${index}-${locIndex}`">
                  <template #header>
                    <div class="location-panel-header">
                      <span>{{ location.path || `/location ${locIndex + 1}` }}</span>
                      <t-button theme="danger" variant="text" size="small" @click.stop="removeLocation(index, locIndex)">
                        <template #icon><t-icon name="delete" /></template>
                      </t-button>
                    </div>
                  </template>
                  <t-form :data="location" label-align="top">
                    <t-form-item label="匹配路径" name="path">
                      <t-input v-model="location.path" placeholder="/" />
                    </t-form-item>
                    <t-form-item label="代理类型" name="proxy_type">
                      <t-radio-group v-model="location.proxy_type" variant="default-filled">
                        <t-radio value="none">无代理</t-radio>
                        <t-radio value="reverse">反向代理</t-radio>
                        <t-radio value="fastcgi">FastCGI</t-radio>
                      </t-radio-group>
                    </t-form-item>
                    <template v-if="location.proxy_type === 'reverse'">
                      <t-form-item label="代理地址" name="proxy_pass">
                        <t-input v-model="location.proxy_pass" placeholder="http://127.0.0.1:8080" />
                      </t-form-item>
                      <t-form-item label="代理主机头" name="proxy_set_host">
                        <t-input v-model="location.proxy_set_host" placeholder="$host" />
                      </t-form-item>
                      <t-form-item label="代理 X-Real-IP" name="proxy_set_real_ip">
                        <t-input v-model="location.proxy_set_real_ip" placeholder="$remote_addr" />
                      </t-form-item>
                      <t-form-item label="代理 X-Forwarded-For" name="proxy_set_xff">
                        <t-input v-model="location.proxy_set_xff" placeholder="$proxy_add_x_forwarded_for" />
                      </t-form-item>
                      <t-form-item label="代理超时(秒)" name="proxy_timeout">
                        <t-input-number v-model="location.proxy_timeout" :min="0" :max="3600" style="width: 200px" />
                      </t-form-item>
                      <t-form-item label="WebSocket 支持" name="proxy_websocket">
                        <t-switch v-model="location.proxy_websocket" />
                      </t-form-item>
                    </template>
                    <template v-if="location.proxy_type === 'fastcgi'">
                      <t-form-item label="FastCGI 地址" name="fastcgi_pass">
                        <t-input v-model="location.fastcgi_pass" placeholder="127.0.0.1:9000" />
                      </t-form-item>
                      <t-form-item label="FastCGI 参数" name="fastcgi_param">
                        <t-textarea v-model="location.fastcgi_param" placeholder="SCRIPT_FILENAME $document_root$fastcgi_script_name" :autosize="{ minRows: 2, maxRows: 4 }" />
                      </t-form-item>
                    </template>
                    <t-form-item label="别名" name="alias">
                      <t-input v-model="location.alias" placeholder="/var/www/alias" />
                    </t-form-item>
                    <t-form-item label="尝试文件" name="try_files">
                      <t-input v-model="location.try_files" placeholder="$uri $uri/ =404" />
                    </t-form-item>
                    <t-form-item label="重写规则" name="rewrite">
                      <t-textarea v-model="location.rewrite" placeholder="^/old/(.*)$ /new/$1 permanent" :autosize="{ minRows: 2, maxRows: 4 }" />
                    </t-form-item>
                  </t-form>
                </t-collapse-panel>
              </t-collapse>
            </div>
          </t-form>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </t-card>
</template>

<script lang="ts" setup>
import { type NginxConfig } from '../types'
import { previewLogFormat as previewLog } from '../func/log-preview'

const props = defineProps({
  config: {
    type: Object as PropType<NginxConfig>,
    required: true
  }
})

const emit = defineEmits(['add-server', 'remove-server', 'update-server-name', 'add-location', 'remove-location'])

const activeServerKeys = ref<string[]>([])
const activeLocationKeys = ref<string[]>([])

function addServer() {
  emit('add-server')
  activeServerKeys.value = [(props.config.http.servers.length - 1).toString()]
}

function removeServer(index: number) {
  emit('remove-server', index)
}

function updateServerName(index: number, value: string) {
  emit('update-server-name', index, value)
}

function addLocation(serverIndex: number) {
  emit('add-location', serverIndex)
  activeLocationKeys.value.push(`${serverIndex}-${props.config.http.servers[serverIndex]!.locations.length - 1}`)
}

function removeLocation(serverIndex: number, locationIndex: number) {
  emit('remove-location', serverIndex, locationIndex)
}

function previewLogFormat(serverIndex: number) {
  const server = props.config.http.servers[serverIndex]
  if (!server) return
  previewLog(server)
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

.server-list {
  .server-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--td-size-6);

    h3 {
      margin: 0;
      font: var(--td-font-title-medium);
      color: var(--td-text-color-primary);
    }
  }

  .server-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
  }

  .location-list {
    margin-top: var(--td-size-6);

    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--td-size-4);
      font: var(--td-font-body-medium);
      color: var(--td-text-color-secondary);
    }

    .location-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
    }
  }
}

.log-preview {
  margin-top: var(--td-size-3);
  padding: var(--td-size-4);
  background: var(--td-bg-color-component);
  border-radius: var(--td-radius-medium);
  border-left: 3px solid var(--td-brand-color);

  strong {
    display: block;
    margin-bottom: var(--td-size-2);
    font: var(--td-font-body-small);
    color: var(--td-text-color-secondary);
  }

  code {
    display: block;
    padding: var(--td-size-3);
    background: var(--td-bg-color-page);
    border-radius: var(--td-radius-small);
    font: var(--td-font-caption);
    color: var(--td-text-color-primary);
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>
