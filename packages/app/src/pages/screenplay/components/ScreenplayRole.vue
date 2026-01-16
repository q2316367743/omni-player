<template>
  <aside class="role-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        <app-tool-back />
        角色管理
      </h3>
      <t-button theme="primary" size="small" class="!ml-auto" @click="addRole">
        <template #icon>
          <add-icon />
        </template>
        新增角色
      </t-button>
    </div>
    <div class="role-list">
      <div
        v-for="role in roles"
        :key="role.id"
        :class="['role-card', { 'role-active': selectedRoleId === role.id, 'role-narrator': role.in_narrator }]"
        @click="selectRole(role.id)"
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
    </div>
    <t-card v-if="selectedRole" class="role-detail" :bordered="false">
      <div class="detail-header">
        <h4>{{ selectedRole.name }}</h4>
        <t-button theme="default" variant="text" size="small" @click="editRole()">
          <edit-icon />
        </t-button>
      </div>
      <div class="detail-section">
        <t-divider></t-divider>
        <t-tag theme="default" size="small" variant="light">公开身份</t-tag>
        <p>{{ selectedRole.identity }}</p>
      </div>
      <div class="detail-section">
        <t-tag theme="default" size="small" variant="light">性格描述</t-tag>
        <p>{{ selectedRole.personality }}</p>
      </div>
      <div class="detail-section">
        <t-tag theme="warning" size="small" variant="light">私有信息</t-tag>
        <p>{{ selectedRole.secret_info }}</p>
      </div>
    </t-card>
  </aside>
</template>
<script lang="ts" setup>
import type {SpRole} from "@/entity/screenplay";
import {AddIcon, EditIcon} from "tdesign-icons-vue-next";
import {computed} from "vue";

const props = defineProps({
  roles: {
    type: Array as PropType<Array<SpRole>>,
    default: () => []
  }
});
const selectedRoleId = ref('');

const selectedRole = computed(() => props.roles.find(r => r.id === selectedRoleId.value))

const selectRole = (id: string) => {
  selectedRoleId.value = id
}

const addRole = () => {

}

const editRole = () => {
}

</script>
<style scoped lang="less">
@import "./less/ScreenplayRole.less";
</style>
