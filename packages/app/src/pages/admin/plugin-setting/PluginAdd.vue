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
            <t-input v-model="linkPayload.url" placeholder="请输入网址"/>
          </t-form-item>
          <t-form-item label="浏览器" label-align="top">
            <t-select v-model="linkPayload.openWith" placeholder="请选择浏览器" :options="[
          {label: '默认浏览器', value: 'default'},
          {label: 'Edge', value: 'edge'},
          {label: 'Chrome', value: 'chrome'},
          {label: 'Firefox', value: 'firefox'},
          {label: 'Safari', value: 'safari'},
          {label: '本地浏览器窗口', value: 'tauri'},
          {label: '自定义浏览器程序', value: 'customer'}
        ]"/>
          </t-form-item>
          <t-form-item v-if="linkPayload.openWith === 'customer'" label="浏览器文件地址" label-align="top">
            <XhFileSelect v-model="linkPayload.program" placeholder="请选择浏览器文件地址"
                          title="请选择浏览器文件地址"/>
          </t-form-item>
        </template>
        <!-- 打开软件 -->
        <template v-else-if="data.type === 'exe'">
          <t-form-item label="软件路径" label-align="top">
            <XhFileSelect v-model="exePayload.path" placeholder="请选择可执行文件"
                          title="请选择可执行文件"/>
          </t-form-item>
        </template>
        <!-- 执行脚本 -->
        <template v-else-if="data.type === 'script'">
          <t-form-item label="脚本路径" label-align="top">
            <XhFileSelect v-model="scriptPayload.path" placeholder="请选择脚本文件"
                          title="请选择脚本文件"/>
          </t-form-item>
          <t-form-item label="解释器" label-align="top">
            <t-input v-model="scriptPayload.interpreter" placeholder="如: /bin/bash, python, node"/>
          </t-form-item>
          <t-form-item label="执行目录" label-align="top">
            <XhFileSelect v-model="scriptPayload.cwd" placeholder="请选择执行目录"
                          title="请选择执行目录" directory/>
          </t-form-item>
        </template>
        <!-- 打开文件夹 -->
        <template v-else-if="data.type === 'folder'">
          <t-form-item label="文件夹路径" label-align="top">
            <XhFileSelect v-model="folderPayload.path" placeholder="请选择文件夹"
                          title="请选择文件夹" directory/>
          </t-form-item>
        </template>
        <!-- 打开文件 -->
        <template v-else-if="data.type === 'file'">
          <t-form-item label="文件路径" label-align="top">
            <XhFileSelect v-model="filePayload.path" placeholder="请选择文件"
                          title="请选择文件"/>
          </t-form-item>
          <t-form-item label="打开方式" label-align="top">
            <t-input v-model="filePayload.openWith" placeholder="留空使用默认程序打开"/>
          </t-form-item>
        </template>
        <!-- 执行命令 -->
        <template v-else-if="data.type === 'command'">
          <t-form-item label="命令" label-align="top">
            <t-textarea v-model="commandPayload.command" placeholder="请输入要执行的命令"
                        :autosize="{minRows: 2, maxRows: 5}"/>
          </t-form-item>
          <t-form-item label="执行程序" label-align="top">
            <t-input v-model="commandPayload.openWith" placeholder="如: /bin/bash, cmd.exe, powershell"/>
          </t-form-item>
          <t-form-item label="执行目录" label-align="top">
            <XhFileSelect v-model="commandPayload.cwd" placeholder="请选择执行目录"
                          title="请选择执行目录" directory/>
          </t-form-item>
        </template>
        <!-- 模拟按键 -->
        <template v-else-if="data.type === 'keyboard'">
          <t-form-item label="按键" label-align="top">
            <t-input v-model="keyboardPayload.key" placeholder="如: Ctrl+C, Command+V, Alt+Tab"/>
          </t-form-item>
        </template>
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
import {
  DEFAULT_TOOLS,
  type ToolItem,
  ToolItemTypeOptions,
  type ToolItemLink,
  type ToolItemExe,
  type ToolItemScript,
  type ToolItemFolder,
  type ToolItemFile,
  type ToolItemCommand,
  type ToolItemKeyboard
} from "@/global/PluginList.ts";

const props = defineProps({
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
]));

const linkPayload = computed({
  get: () => data.value.payload as ToolItemLink,
  set: (val) => data.value.payload = val
});

const exePayload = computed({
  get: () => data.value.payload as ToolItemExe,
  set: (val) => data.value.payload = val
});

const scriptPayload = computed({
  get: () => data.value.payload as ToolItemScript,
  set: (val) => data.value.payload = val
});

const folderPayload = computed({
  get: () => data.value.payload as ToolItemFolder,
  set: (val) => data.value.payload = val
});

const filePayload = computed({
  get: () => data.value.payload as ToolItemFile,
  set: (val) => data.value.payload = val
});

const commandPayload = computed({
  get: () => data.value.payload as ToolItemCommand,
  set: (val) => data.value.payload = val
});

const keyboardPayload = computed({
  get: () => data.value.payload as ToolItemKeyboard,
  set: (val) => data.value.payload = val
});

</script>
<style scoped lang="less">

</style>
