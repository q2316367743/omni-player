<template>
  <div class="mt-16px">
    <div class="fiction-header">
      <h3 class="fiction-title">
        <edit1-icon class="title-icon"/>
        剧本演绎
      </h3>
      <div class="flex gap-4px">
        <t-button theme="primary" variant="text" shape="square" @click="loadScreenplay()">
          <template #icon>
            <refresh-icon/>
          </template>
        </t-button>
        <t-button theme="primary" variant="text" shape="square" @click="openScreenplayAdd(loadScreenplay)">
          <template #icon>
            <add-icon/>
          </template>
        </t-button>
      </div>
    </div>
    <div class="screenplay-content">
      <t-list>
        <t-list-item v-for="screenplay in screenplays" :key="screenplay.id">
          <t-link theme="primary" @click="toScreenplay(screenplay.id)">{{ screenplay.title }}</t-link>
          <template #action>
            <t-space>
              <t-button theme="primary" variant="text" shape="square" @click="openScreenplayUpdate(screenplay, loadScreenplay)">
                <template #icon>
                  <edit1-icon/>
                </template>
              </t-button>
              <t-button theme="danger" variant="text" shape="square" @click="deleteScreenplay(screenplay.id, loadScreenplay)">
                <template #icon>
                  <delete-icon/>
                </template>
              </t-button>
            </t-space>
          </template>
        </t-list-item>
      </t-list>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {AddIcon, DeleteIcon, Edit1Icon, RefreshIcon} from "tdesign-icons-vue-next";
import {listScreenplayService} from "@/services/screenplay";
import type {Screenplay} from "@/entity/screenplay";
import {deleteScreenplay, openScreenplayAdd, openScreenplayUpdate} from "@/pages/home/default/func/ScreenplayEdit.tsx";

const router = useRouter();

const screenplays = ref<Array<Screenplay>>([]);

const loadScreenplay = async () => {
  screenplays.value = await listScreenplayService();
}

const toScreenplay = (id: string) => {
  router.push(`/mp/screenplay/${id}/chapter`)
}

onMounted(() => {
  loadScreenplay()
})
</script>
<style scoped lang="less">
.fiction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--td-size-5);

  .fiction-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--td-size-3);
    letter-spacing: -0.3px;

    .title-icon {
      font-size: 22px;
      color: var(--td-brand-color);
    }
  }
}
</style>
