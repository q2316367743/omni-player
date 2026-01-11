<template>
  <div class="w-full h-full overflow-auto release-content">
    <div class="flex sticky top-0 left-0 right-0 row">
      <div class="cell">版本</div>
      <div v-for="instance in instances" :key="instance.id" class="cell instance-name"
           @click="openReleaseInstanceInfo(instance.project_id, instance.id)"
           @contextmenu="openReleaseInstanceContextmenu(instance, listInstance, $event)">
        {{ instance.name }}
      </div>
      <div class="cell">
        <t-button theme="primary" variant="text" shape="square"
                  @click="openReleaseInstanceAdd(select.id, listInstance)">
          <template #icon>
            <add-icon/>
          </template>
        </t-button>
      </div>
    </div>
    <div v-for="version in versions" :key="version.id" class="row">
      <div class="cell">{{ version.version }}</div>
      <div v-for="instance in instances" :key="instance.id" class="cell">
        <t-button v-if="deploySet.has(`${instance.id}-${version.id}`)">部署</t-button>
        <div v-else></div>
      </div>
    </div>
    <div class="row">
      <div class="cell">
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <add-icon/>
          </template>
        </t-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {ReleaseProject} from "@/entity/release/ReleaseProject.ts";
import type {ReleaseInstance} from "@/entity/release/ReleaseInstance.ts";
import type {ReleaseVersion} from "@/entity/release/ReleaseVersion.ts";
import type {ReleaseDeploy} from "@/entity/release/ReleaseDeploy.ts";
import {openReleaseInstanceInfo} from "@/pages/app/programmer/release/func/ReleaseInstanceInfo.tsx";
import {
  openReleaseInstanceAdd, openReleaseInstanceContextmenu,
} from "@/pages/app/programmer/release/func/ReleaseInstanceEdit.tsx";
import {listReleaseInstanceService, listReleaseVersionService} from "@/services/release";
import {AddIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  select: {
    type: Object as PropType<ReleaseProject>,
    required: true
  }
});

const instances = ref(new Array<ReleaseInstance>());
const versions = ref(new Array<ReleaseVersion>());
const deployItems = ref(new Array<ReleaseDeploy>());

const deploySet = computed(() => new Set(deployItems.value.map(e => `${e.instance_id}-${e.version_id}`)));

const listInstance = async () => {
  instances.value = await listReleaseInstanceService(props.select.id);
};
const listVersion = async () => {
  versions.value = await listReleaseVersionService(props.select.id);
};

watch(() => props.select, () => {
  listInstance();
  listVersion();
}, {immediate: true})
</script>
<style scoped lang="less">
.release-content {
  .row {
    border-bottom: 1px solid var(--td-border-level-1-color);

    .cell {
      border-right: 1px solid var(--td-border-level-1-color);
      padding: 6px 8px;
      width: 64px;
      text-align: center;
      align-items: center;
      line-height: 32px;

      &.instance-name {
        cursor: pointer;
        user-select: none;
      }
    }
  }
}
</style>
