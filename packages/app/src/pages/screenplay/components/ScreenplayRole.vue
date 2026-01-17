<template>
  <aside class="role-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        <app-tool-back/>
        角色管理
      </h3>
      <t-button theme="primary" size="small" class="!ml-auto" @click="addRole">
        <template #icon>
          <add-icon/>
        </template>
        新增角色
      </t-button>
    </div>
    <div class="role-list">
      <t-popup v-for="role in roles" :key="role.id" trigger="click" show-arrow placement="right">
        <div
          :class="['role-card', {  'role-narrator': role.in_narrator }]"
        >
          <div class="role-avatar">
            {{ role.name.charAt(0) }}
          </div>
          <div class="role-info">
            <div class="role-name">{{ role.name }}</div>
            <div class="role-identity">{{ role.identity }}</div>
          </div>
          <t-tag v-if="role.in_narrator" theme="primary" size="small" variant="light" class="role-badge">叙述者</t-tag>
        </div>
        <template #content>
          <div class="role-detail">
            <div class="detail-header">
              <h4>{{ role.name }}</h4>
              <t-button theme="danger" variant="text" size="small" @click="deleteRole(role)">
                <delete-icon />
              </t-button>
            </div>
            <t-divider size="8px"/>
            <div class="detail-section">
              <t-tag theme="default" size="small" variant="light">公开身份</t-tag>
              <p>{{ role.identity }}</p>
            </div>
            <div class="detail-section">
              <t-tag theme="default" size="small" variant="light">性格描述</t-tag>
              <p>{{ role.personality }}</p>
            </div>
            <div class="detail-section">
              <t-tag theme="warning" size="small" variant="light">私有信息</t-tag>
              <p>{{ role.secret_info }}</p>
            </div>
          </div>

        </template>
      </t-popup>

    </div>
  </aside>
</template>
<script lang="ts" setup>
import type {Screenplay, SpRole} from "@/entity/screenplay";
import {AddIcon, DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import {computed} from "vue";
import {openSpRoleAdd, openSpRoleDelete} from "@/pages/screenplay/func/SpRoleEdit.tsx";

const props = defineProps({
  roles: {
    type: Array as PropType<Array<SpRole>>,
    default: () => []
  },
  screenplay: {
    type: Object as PropType<Screenplay>,
    required: true
  }
});
const emit = defineEmits(['refresh']);

const addRole = () => {
  openSpRoleAdd(props.screenplay.id, () => {
    emit('refresh');
  })
}

const deleteRole = (role: SpRole) => {
  openSpRoleDelete(role.id, () => {
    emit('refresh');
  })
}

</script>
<style scoped lang="less">
@import "./less/ScreenplayRole.less";
</style>
