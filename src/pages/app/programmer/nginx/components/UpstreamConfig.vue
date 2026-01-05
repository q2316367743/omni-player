<template>
  <t-card class="config-card" bordered>
    <div class="upstream-list">
      <div class="upstream-header">
        <h3>上游服务器列表</h3>
        <t-button theme="primary" size="small" @click="addUpstream">
          <template #icon>
            <t-icon name="add"/>
          </template>
          添加上游
        </t-button>
      </div>
      <t-collapse v-model="activeUpstreamKeys">
        <t-collapse-panel v-for="(upstream, index) in config.http.upstreams" :key="index" :value="index.toString()">
          <template #header>
            <div class="upstream-panel-header">
              <span>{{ upstream.name || `上游 ${index + 1}` }}</span>
              <t-button theme="danger" variant="text" size="small" @click.stop="removeUpstream(index)">
                <template #icon>
                  <t-icon name="delete"/>
                </template>
              </t-button>
            </div>
          </template>
          <t-form :data="upstream" label-align="top">
            <t-form-item label="上游名称" name="name">
              <t-input v-model="upstream.name" placeholder="backend"/>
            </t-form-item>
            <t-form-item label="负载均衡策略" name="lb_method">
              <t-select v-model="upstream.lb_method" :options="lbMethodOptions" placeholder="选择负载均衡策略"/>
            </t-form-item>
            <t-divider>服务器节点</t-divider>
            <div class="server-nodes">
              <div class="nodes-header">
                <span>节点列表</span>
                <t-button theme="primary" variant="outline" size="small" @click="addUpstreamServer(index)">
                  <template #icon>
                    <t-icon name="add"/>
                  </template>
                  添加节点
                </t-button>
              </div>
              <t-table :data="upstream.servers" :columns="upstreamServerColumns" bordered size="small">
                <template #address="{ row }">
                  <t-input v-model="row.address" placeholder="127.0.0.1:8080" size="small"/>
                </template>
                <template #weight="{ row }">
                  <t-input-number v-model="row.weight" :min="1" :max="100" size="small" style="width: 100px"/>
                </template>
                <template #max_fails="{ row }">
                  <t-input-number v-model="row.max_fails" :min="0" :max="10" size="small" style="width: 100px"/>
                </template>
                <template #fail_timeout="{ row }">
                  <t-input-number v-model="row.fail_timeout" :min="0" :max="3600" size="small" style="width: 100px"/>
                </template>
                <template #backup="{ row }">
                  <t-switch v-model="row.backup" size="small"/>
                </template>
                <template #down="{ row }">
                  <t-switch v-model="row.down" size="small"/>
                </template>
                <template #action="{ rowIndex }">
                  <t-button theme="danger" variant="text" size="small" @click="removeUpstreamServer(index, rowIndex)">
                    <template #icon>
                      <t-icon name="delete"/>
                    </template>
                  </t-button>
                </template>
              </t-table>
            </div>
          </t-form>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </t-card>
</template>

<script lang="ts" setup>
import {type NginxConfig} from '../types'

const props = defineProps({
  config: {
    type: Object as PropType<NginxConfig>,
    required: true
  }
})

const emit = defineEmits(['add-upstream', 'remove-upstream', 'add-upstream-server', 'remove-upstream-server'])

const activeUpstreamKeys = ref<string[]>([])

const lbMethodOptions = [
  {label: '轮询 (默认)', value: ''},
  {label: '最少连接', value: 'least_conn'},
  {label: 'IP 哈希', value: 'ip_hash'},
  {label: '加权轮询', value: 'weight'}
]

const upstreamServerColumns = [
  {colKey: 'address', title: '地址', width: '200px'},
  {colKey: 'weight', title: '权重', width: '120px'},
  {colKey: 'max_fails', title: '最大失败', width: '120px'},
  {colKey: 'fail_timeout', title: '失败超时', width: '120px'},
  {colKey: 'backup', title: '备用', width: '80px'},
  {colKey: 'down', title: '下线', width: '80px'},
  {colKey: 'action', title: '操作', width: '80px'}
]

function addUpstream() {
  emit('add-upstream')
  activeUpstreamKeys.value = [(props.config.http.upstreams.length - 1).toString()]
}

function removeUpstream(index: number) {
  emit('remove-upstream', index)
}

function addUpstreamServer(upstreamIndex: number) {
  emit('add-upstream-server', upstreamIndex)
}

function removeUpstreamServer(upstreamIndex: number, serverIndex: number) {
  emit('remove-upstream-server', upstreamIndex, serverIndex)
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
}

.upstream-list {
  .upstream-header {
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

  .upstream-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
  }

  .server-nodes {
    margin-top: var(--td-size-6);

    .nodes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--td-size-4);
      font: var(--td-font-body-medium);
      color: var(--td-text-color-secondary);
    }
  }
}
</style>
