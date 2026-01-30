<template>
  <div class="screenplay-container">

    <screenplay-side v-if="screenplay" v-model:chapter-id="currentChapterId" :roles :screenplay :chapters
                     @refresh-role="fetchRoles" @refresh-chapter="fetchChapters"/>

    <main class="main-content" v-if="currentChapterId">
      <div class="chat-container">
        <screenplay-dialogue v-if="currentSceneId" :chapter-id="currentChapterId" :scene-id="currentSceneId"/>
        <empty-result v-else title="请先选择场景"/>
        <screenplay-control v-if="engine" :engine="engine"/>
      </div>
    </main>
    <empty-result v-else title="请先选择章节" class="flex-1"/>
  </div>
</template>

<script lang="ts" setup>
import {map} from "@/util";
import type {SpRole, SpScene, Screenplay, SpChapter} from '@/entity/screenplay'
import {
  getScreenplayService, listSpChapterService,
  listSpRoleService,
  listSpSceneService
} from "@/services/screenplay";
import {ScreenEngine} from "@/pages/mp/screenplay/chapter/ScreenEngine.ts";
import ScreenplaySide from "@/pages/mp/screenplay/chapter/layout/ScreenplaySide.vue";
import ScreenplayDialogue from "@/pages/mp/screenplay/chapter/layout/ScreenplayDialogue.vue";
import ScreenplayControl from "@/pages/mp/screenplay/chapter/layout/ScreenplayControl.vue";
import MessageUtil from "@/util/model/MessageUtil.ts";

const route = useRoute();
const router = useRouter();

const screenplay = ref<Screenplay>();
const roles = ref<SpRole[]>([]);
const roleMap = ref(new Map<string, SpRole>());
const chapters = ref<Array<SpChapter>>([]);

const currentChapterId = ref<string>();
const currentSceneId = ref<string>();
const scenes = ref<SpScene[]>([]);

const engine = shallowRef<ScreenEngine>();

const fetchRoles = async () => {
  if (!screenplay.value) return;
  roles.value = await listSpRoleService(screenplay.value.id);
  roleMap.value = map(roles.value, 'id');
}
const fetchScenes = async () => {
  if (!screenplay.value) return;
  scenes.value = await listSpSceneService(screenplay.value.id);
  currentSceneId.value = scenes.value[scenes.value.length - 1]?.id;
}
const fetchChapters = async () => {
  if (!screenplay.value) return;
  chapters.value = await listSpChapterService(screenplay.value.id);
}

watch(currentChapterId, fetchScenes);

onMounted(async () => {
  screenplay.value = await getScreenplayService(route.params.id as string);
  if (!screenplay.value) {
    router.back();
    MessageUtil.error(`剧本「${route.params.id}」未找到`)
    return;
  }
  await Promise.all([
    fetchRoles(),
    fetchChapters()
  ]);
  // 当前章节
  currentChapterId.value = chapters.value[chapters.value.length - 1]?.id;
  // 初始化自动演绎管理器
  engine.value = new ScreenEngine({
    screenplay: screenplay.value!,
    getCurrentScene: () => scenes.value.find(s => s.id === currentSceneId.value),
    getScenes: () => scenes.value,
    getRoles: () => roles.value,
    getNarrator: () => roles.value.find(r => r.type === 'narrator'),
    getRoleMap: () => roleMap.value,
    getChapterId: () => currentChapterId.value,
    onRefreshChapter: fetchChapters,
    onRefreshRole: fetchRoles,
    onRefreshScene: fetchScenes
  })
})
</script>

<style scoped lang="less">
.screenplay-container {
  display: flex;
  height: calc(100vh - 57px);
  background: var(--td-bg-color-container);
  font-family: var(--td-font-family), serif;
  overflow: hidden;

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>
