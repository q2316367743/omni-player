<template>
  <aside class="role-sidebar">
    <div v-if="type === 'chapter'" class="role-content">
      <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item py-8px px-16px">
        <t-link :theme="chapterId === chapter.id ? 'primary':'default'" @click="selectChapter(chapter.id)">
          第{{ chapter.index }}章 {{ chapter.title }}
        </t-link>
      </div>
      <div class="p-8px">
        <t-button theme="primary" variant="outline" block @click="handleAdd">
          <template #icon>
            <add-icon/>
          </template>
          新增
        </t-button>
      </div>
    </div>
    <div v-if="type === 'role'" class="role-content">
      <div class="role-list">
        <t-popup v-for="role in roles" :key="role.id" trigger="click" show-arrow placement="right"
                 destroy-on-close>
          <div class="role-card">
            <div class="role-avatar">{{ role.name.charAt(0) }}</div>
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
        <t-tab-panel label="章节" value="chapter"/>
        <t-tab-panel label="角色" value="role"/>
        <t-tab-panel label="日志" value="log"/>
      </t-tabs>
    </div>
  </aside>
</template>
<script lang="ts" setup>
import {type Screenplay, type SpChapter, type SpRole} from "@/entity/screenplay";
import {AddIcon} from "tdesign-icons-vue-next";
import SpRoleDetail from "@/pages/mp/screenplay/chapter/components/SpRoleDetail.vue";
import {openSpChapterAdd} from "@/pages/mp/screenplay/chapter/func/SpChapterEdit.tsx";

const props = defineProps({
  screenplay: {
    type: Object as PropType<Screenplay>,
    required: true
  },
  chapters: {
    type: Array as PropType<Array<SpChapter>>,
    default: () => []
  },
  roles: {
    type: Array as PropType<Array<SpRole>>,
    default: () => []
  },
  chapterId: {
    type: String,
  }
});
const emit = defineEmits(['refreshRole', 'refreshChapter', 'update:chapterId']);

const type = ref('chapter');

const deleteRole = () => {
  emit('refreshRole');
}
const selectChapter = (id: string) => {
  emit('update:chapterId', id);
}
const handleAdd = () => {
  openSpChapterAdd(props.screenplay.id, () => {
    emit('refreshChapter');
  })
}
</script>
<style scoped lang="less">
@import "less/ScreenplayRole.less";
</style>
