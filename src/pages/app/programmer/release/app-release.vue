<template>
  <app-tool-layout>
    <template #title>
      <div class="flex gap-8px items-center">
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <view-list-icon/>
          </template>
        </t-button>
        <div>发版助手</div>
      </div>
    </template>
    <t-layout class="w-full h-full">
      <t-aside>
        <release-aside :select-project-id="selectProject?.id" @select="handleSelectProject"/>
      </t-aside>
      <t-content>
        <release-content v-if="selectProject" :select="selectProject" />
        <empty-result v-else title="请选择项目"/>
      </t-content>
    </t-layout>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import {ViewListIcon} from "tdesign-icons-vue-next";
import type {ReleaseProject} from "@/entity/release/ReleaseProject.ts";
import ReleaseAside from "@/pages/app/programmer/release/components/ReleaseAside.vue";
import ReleaseContent from "@/pages/app/programmer/release/components/ReleaseContent.vue";

const selectProject = ref<ReleaseProject>()

function handleSelectProject(project?: ReleaseProject) {
  if (project && selectProject.value?.id === project?.id) {
    selectProject.value = undefined;
    return;
  }
  selectProject.value = project
}
</script>
<style scoped lang="less">

</style>
