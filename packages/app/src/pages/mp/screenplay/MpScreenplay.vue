<template>
  <app-tool-layout :title="screenplay?.title" home>
    <template #action>
      <t-radio-group v-model="page" variant="default-filled">
        <t-radio-button value="chapter">章节</t-radio-button>
        <t-radio-button value="role">角色</t-radio-button>
      </t-radio-group>
    </template>
    <div class="screenplay-app">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['MpSpChapter', 'MpSpRole']">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </div>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import type {Screenplay} from "@/entity/screenplay";
import {getScreenplayService} from "@/services/screenplay";

const route = useRoute();
const router = useRouter();

const page = ref('chapter');
const screenplay = ref<Screenplay>();

onMounted(async () => {
  screenplay.value = await getScreenplayService(route.params.id as string);
});

watch(page, value => {
  router.push(`/mp/screenplay/${route.params.id}/${value}`);
})
</script>
<style scoped lang="less">

</style>
