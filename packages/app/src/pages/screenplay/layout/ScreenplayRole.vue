<template>
  <aside class="role-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        <app-tool-back/>
        {{ screenplay.title }}
      </h3>
    </div>
    <div v-if="type === 'all'" class="role-content">
      <div class="role-single">
        <div>决策者</div>
        <t-button theme="primary" size="small" class="!ml-auto" @click="addOrUpdateDecisionRole">
          <template #icon>
            <edit1-icon v-if="decisionRoles.length>0"/>
            <add-icon v-else/>
          </template>
          {{ decisionRoles.length > 0 ? '修改' : '新增' }}
        </t-button>
      </div>
      <div class="role-single">
        <div>叙述者</div>
        <t-button theme="primary" size="small" class="!ml-auto" @click="addOrUpdateNarratorRole">
          <template #icon>
            <edit1-icon v-if="narratorRoles.length>0"/>
            <add-icon v-else/>
          </template>
          {{ narratorRoles.length > 0 ? '修改' : '新增' }}
        </t-button>
      </div>
      <div class="role-header">
        <div>成员</div>
        <t-button theme="primary" size="small" class="!ml-auto" @click="addMemberRole">
          <template #icon>
            <add-icon/>
          </template>
          新增
        </t-button>
      </div>
      <div class="role-list">
        <t-popup v-for="role in memberRoles" :key="role.id" trigger="click" show-arrow placement="right"
                 destroy-on-close>
          <div class="role-card">
            <div class="role-avatar">
              {{ role.name.charAt(0) }}
            </div>
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-identity">{{ role.identity }}</div>
            </div>
          </div>
          <template #content>
            <sp-role-detail :role="role" :screenplay="screenplay" remove @refresh="deleteRole"/>
          </template>
        </t-popup>
      </div>
    </div>
    <div v-else-if="type === 'current'" class="role-content">
      <div class="role-list">
        <div v-if="decisionRoles[0]" class="role-card">
          <div class="role-avatar">
            <t-loading v-if="loadingRoleIds.includes(decisionRoles[0].id)" size="small" theme="primary"/>
            <template v-else>{{ decisionRoles[0].name.charAt(0) }}</template>
          </div>
          <div class="role-info">
            <div class="role-name">{{ decisionRoles[0].name }}</div>
          </div>
        </div>
        <div v-if="narratorRoles[0]" class="role-card">
          <div class="role-avatar">
            <t-loading v-if="loadingRoleIds.includes(narratorRoles[0].id)" size="small" theme="primary"/>
            <template v-else>{{ narratorRoles[0].name.charAt(0) }}</template>
          </div>
          <div class="role-info">
            <div class="role-name">{{ narratorRoles[0].name }}</div>
          </div>
        </div>
        <t-popup v-for="role in currentRoles" :key="role.id" trigger="click" show-arrow placement="right"
                 destroy-on-close>
          <div class="role-card">
            <div class="role-avatar">
              <t-loading v-if="loadingRoleIds.includes(role.id)" size="small" theme="primary"/>
              <template v-else>{{ role.name.charAt(0) }}</template>
            </div>
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-identity">{{ role.identity }}</div>
            </div>
          </div>
          <template #content>
            <sp-role-detail :role="role" :screenplay="screenplay" @refresh="deleteRole"/>
          </template>
        </t-popup>
      </div>
    </div>
    <div class="role-footer">
      <t-tabs v-model="type" placement="bottom">
        <t-tab-panel label="全部角色" value="all"/>
        <t-tab-panel label="当前场景" value="current"/>
      </t-tabs>
    </div>
  </aside>
</template>
<script lang="ts" setup>
import {type Screenplay, type SpRole} from "@/entity/screenplay";
import {AddIcon, Edit1Icon} from "tdesign-icons-vue-next";
import {
  openSpDecisionRoleAdd,
  openSpNarratorRoleAdd,
  openSpRoleAdd,
} from "@/pages/screenplay/func/SpRoleEdit.tsx";
import {MapWrapper} from "@/util";
import type {SpRoleAppearance} from "@/entity/screenplay/SpRoleAppearance.ts";
import SpRoleDetail from "@/pages/screenplay/components/SpRoleDetail.vue";

const props = defineProps({
  roles: {
    type: Array as PropType<Array<SpRole>>,
    default: () => []
  },
  screenplay: {
    type: Object as PropType<Screenplay>,
    required: true
  },
  roleMap: {
    type: Object as PropType<Map<string, SpRole>>,
    required: true
  },
  roleAppearanceMap: {
    type: Object as PropType<MapWrapper<string, Array<SpRoleAppearance>>>,
    default: () => new Map<string, Array<SpRoleAppearance>>(),
  },
  currentSceneId: {
    type: String,
  },
  loadingRoleIds: {
    type: Array as PropType<Array<string>>,
    default: () => []
  }
});
const emit = defineEmits(['refresh']);

const type = ref('all');

const decisionRoles = computed(() => props.roles.filter(role => role.type === 'decision'));
const narratorRoles = computed(() => props.roles.filter(role => role.type === 'narrator'));
const memberRoles = computed(() => props.roles.filter(role => role.type === 'member'));

const currentRoles = computed(() => props.roleAppearanceMap.getOrDefault(props.currentSceneId || '', [])
  .map(e => props.roleMap.get(e.role_id)!))

const addMemberRole = () => {
  openSpRoleAdd(props.screenplay.id, () => {
    emit('refresh');
  })
}

const addOrUpdateNarratorRole = () => {
  openSpNarratorRoleAdd(props.screenplay.id, () => {
    emit('refresh');
  }, narratorRoles.value[0])
}

const addOrUpdateDecisionRole = () => {
  openSpDecisionRoleAdd(props.screenplay.id, () => {
    emit('refresh');
  }, decisionRoles.value[0])
}

const deleteRole = () => {
  emit('refresh');
}

</script>
<style scoped lang="less">
@import "./less/ScreenplayRole.less";
</style>
