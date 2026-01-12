<template>
  <div class="w-full h-full">
    <div class="header">
      <t-button block @click="openReleaseProjectDialog(handleList)">
        <template #icon>
          <add-icon/>
        </template>
        <span>新增项目</span>
      </t-button>
    </div>
    <div class="list">
      <div
        v-for="item in list"
        :key="item.id"
        :class="{'list-item': true, active: selectProjectId === item.id}"
        @click="handleSelect(item)"
        @contextmenu="openReleaseProjectCxt($event, item, onUpdate)"
      >
        <div class="name">{{ item.name }}</div>
        <div class="desc">{{ item.desc }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {ReleaseProject} from "@/entity/app/release";
import {listReleaseProject} from "@/services/release";
import {
  openReleaseProjectCxt,
  openReleaseProjectDialog
} from "@/pages/app/programmer/release/func/ReleaseProjectEdit.tsx";
import {AddIcon} from "tdesign-icons-vue-next";

defineProps({
  selectProjectId: String
});

const emit = defineEmits(['select']);

const list = ref(new Array<ReleaseProject>())

const handleList = async () => {
  list.value = await listReleaseProject();
}

const handleSelect = (item: ReleaseProject) => {
  emit('select', item);
}

const onUpdate = () => {
  handleList();
  emit('select');
}

tryOnMounted(handleList)
</script>
<style scoped lang="less">
.header {
  padding: 16px;
  border-bottom: 1px solid var(--fluent-border-subtle);
  background: var(--fluent-card-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
}

.list-item {
  padding: 12px 16px;
  border-radius: var(--fluent-radius-smooth);
  cursor: pointer;
  transition: all var(--fluent-transition-normal);
  border: 1px solid transparent;
  background: var(--fluent-card-bg);
  box-shadow: var(--fluent-elevation-1);

  &:hover {
    background: var(--fluent-item-hover);
    border-color: var(--fluent-border-subtle);
    box-shadow: var(--fluent-elevation-2);
    transform: translateY(-1px);
  }

  &.active {
    background: var(--fluent-item-active);
    transform: translateY(0);
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: 4px;
    line-height: 20px;
  }

  .desc {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    line-height: 16px;
  }
}
</style>
