<template>
  <div class="w-full flex gap-16px">
    <div class="w-60% monica-card p-8px">
      <t-form :data="data">
        <t-form-item label="类型" label-align="top">
          <t-select v-model="data.type" :options/>
        </t-form-item>
        <!-- 内部选择 -->
        <template v-if="data.type === 'inner'">
          <t-form-item label="插件" label-align="top">
            <t-select v-model="data.id" :options="DEFAULT_TOOLS.map(e => ({label: e.label, value: e.id}))"/>
          </t-form-item>
        </template>
        <!-- 第三方插件 -->
        <template v-else-if="data.type === 'plugin'"></template>
        <!-- 打开网址 -->
        <template v-else-if="data.type === 'link'">
          <t-form-item label="网址" label-align="top">
            <t-input v-model="data.payload.url" placeholder="请输入网址"/>
          </t-form-item>
          <t-form-item label="浏览器" label-align="top">
            <t-select v-model="data.payload.openWith" placeholder="请选择浏览器" :options="[
          {label: '默认浏览器', value: 'default'},
          {label: 'Edge', value: 'edge'},
          {label: 'Chrome', value: 'chrome'},
          {label: 'Firefox', value: 'firefox'},
          {label: 'Safari', value: 'safari'},
          {label: '本地浏览器窗口', value: 'tauri'},
          {label: '自定义浏览器程序', value: 'customer'}
        ]"/>
          </t-form-item>
          <t-form-item v-if="data.payload.openWith === 'customer'" label="浏览器文件地址" label-align="top">
            <XhFileSelect v-model="data.payload.program" placeholder="请选择浏览器文件地址"
                          titdle="请选择浏览器文件地址"/>
          </t-form-item>
        </template>
        <!-- 打开软件 -->
        <template v-else-if="data.type === 'exe'"></template>
        <!-- 执行脚本 -->
        <template v-else-if="data.type === 'script'"></template>
        <!-- 打开文件夹 -->
        <template v-else-if="data.type === 'folder'"></template>
        <!-- 打开文件 -->
        <template v-else-if="data.type === 'file'"></template>
        <!-- 执行命令 -->
        <template v-else-if="data.type === 'command'"></template>
        <!-- 模拟按键 -->
        <template v-else-if="data.type === 'keyboard'"></template>
      </t-form>
    </div>
    <div class="w-40% monica-card p-8px">
      <t-form :data="data">
        <t-form-item label="图标" label-align="top">
          <xh-avatar v-model="data.icon" folder="setting/plugin" editable :size="48"/>
        </t-form-item>
        <t-form-item label="标题" label-align="top">
          <t-input v-model="data.label" placeholder="请输入标题"/>
        </t-form-item>
        <t-form-item label="功能/用途" label-align="top">
          <t-textarea v-model="data.desc" placeholder="请输入功能/用途" :autosize="{minRows: 1, maxRows: 3}"/>
        </t-form-item>
      </t-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DEFAULT_TOOLS, type ToolItem, ToolItemTypeOptions} from "@/global/PluginList.ts";

const props = defineProps({
  // 是否支持内部调用
  inner: Boolean
});

const data = defineModel({
  type: Object as PropType<ToolItem>,
  default: () => ({
    id: '',
    label: '',
    icon: '',
    desc: '',
    platform: [],
    type: 'exe',
    payload: {
      path: ''
    }
  })
});

const options = computed(() => ([
  ...(props.inner ? [{label: '内部插件', value: 'inner'}] : []),
  ...ToolItemTypeOptions
]))

</script>
<style scoped lang="less">

</style>
