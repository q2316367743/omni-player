<template>
  <t-layout class="h-full w-full">
    <t-header class="flex items-center justify-between px-4 h-14 border-b border-solid" style="border-color: var(--td-border-level-2-color)">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click="goHome">返回首页</t-button>
        <div class="font-semibold">管理后台</div>
      </t-space>
    </t-header>
    <t-layout class="flex-1 min-h-0">
      <t-aside width="220px" class="border-r border-solid" style="border-color: var(--td-border-level-2-color)">
        <t-menu v-model="value" class="h-full" @change="onChange">
          <t-menu-item :value="globalSettingPath">全局设置</t-menu-item>
        </t-menu>
      </t-aside>
      <t-content class="min-h-0 overflow-auto">
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>
<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

const globalSettingPath = '/admin/global-setting';
const value = ref(globalSettingPath);

watch(
  () => route.path,
  (path) => {
    if (path !== value.value) value.value = path;
  },
  { immediate: true },
);

const onChange = (val: string | number) => {
  const path = String(val);
  if (path !== route.path) router.push(path);
};

const goHome = () => {
  router.replace('/home');
};
</script>
