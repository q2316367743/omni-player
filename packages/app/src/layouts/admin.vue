<template>
  <MainLayout>
    <template #header>
      <div class="font-semibold">管理后台</div>
    </template>
    <template #content>
      <t-layout class="h-full">
        <t-aside>
          <t-menu v-model="value" class="h-full" @change="onChange">
            <t-menu-item value="/admin/global-setting">全局设置</t-menu-item>
            <t-menu-item value="/admin/ai-setting">AI 设置</t-menu-item>
            <t-menu-item value="/admin/user-setting">用户设置</t-menu-item>
          </t-menu>
        </t-aside>
        <t-content class="overflow-auto">
          <router-view/>
        </t-content>
      </t-layout>
    </template>
  </MainLayout>
</template>
<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

const value = ref('/admin/global-setting');

watch(
  () => route.path,
  (path) => {
    if (path !== value.value) value.value = path;
  },
  {immediate: true},
);

const onChange = (val: string | number) => {
  const path = String(val);
  if (path !== route.path) router.push(path);
};

</script>
