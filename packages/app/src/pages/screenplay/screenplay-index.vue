<template>
  <div class="screenplay-container">

    <screenplay-role v-if="screenplay" :roles="roles" :screenplay="screenplay" :current-scene-id="currentSceneId" :role-appearance-map="roleAppearanceMap"
                     :role-map="roleMap" @refresh="fetchRoles"/>

    <main class="main-content">
      <screenplay-scene :scenes="scenes" :current-scene-id="currentSceneId" :role-appearance-map="roleAppearanceMap"
                        :role-map="roleMap" @select="onChangeScene"/>

      <div class="chat-container">

        <screenplay-dialogue :role-map="roleMap" :dialogues="dialogues"/>

        <screenplay-control v-if="screenplay" :screenplay="screenplay" :scenes :current-scene-id="currentSceneId"
                            :pause="isPause"
                            @refresh-scene="refreshScene" @refresh-role-appearance="fetchRoleAppearance"
                            @refresh-dialogue="fetchDialogue"/>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import {group, map, MapWrapper} from "@/util";
import type {SpRole, SpScene, SpDialogue, Screenplay} from '@/entity/screenplay'
import {
  getScreenplayService,
  listSpDialogueService, listSpRoleAppearanceService,
  listSpRoleService,
  listSpSceneService
} from "@/services/screenplay";
import ScreenplayRole from "@/pages/screenplay/layout/ScreenplayRole.vue";
import ScreenplayScene from "@/pages/screenplay/layout/ScreenplayScene.vue";
import ScreenplayDialogue from "@/pages/screenplay/layout/ScreenplayDialogue.vue";
import ScreenplayControl from "@/pages/screenplay/layout/ScreenplayControl.vue";
import type {SpRoleAppearance} from "@/entity/screenplay/SpRoleAppearance.ts";

const route = useRoute();

const isPause = ref(true);
const screenplay = ref<Screenplay>();
const roles = ref<SpRole[]>([])
const roleMap = ref(new Map<string, SpRole>());
const scenes = ref<SpScene[]>([])
const dialogues = ref<SpDialogue[]>([])
const currentSceneId = ref<string>();
// 角色分组 场景 => 角色列表
const roleAppearanceMap = ref(new MapWrapper<string, Array<SpRoleAppearance>>());

watch(currentSceneId, async (newSceneId) => {
  if (!screenplay.value) return;
  if (!newSceneId) {
    dialogues.value = [];
    return;
  }
  dialogues.value = await listSpDialogueService(screenplay.value.id, newSceneId)
})

const fetchRoles = async () => {
  if (!screenplay.value) return;
  roles.value = await listSpRoleService(screenplay.value.id);
  roleMap.value = map(roles.value, 'id');
}

const fetchRoleAppearance = async () => {
  if (!screenplay.value) return;
  const list = await listSpRoleAppearanceService(screenplay.value.id);
  roleAppearanceMap.value = group(list, 'scene_id');
}

const fetchScenes = async () => {
  if (!screenplay.value) return;
  scenes.value = await listSpSceneService(screenplay.value.id);
}

const fetchDialogue = async () => {
  if (!screenplay.value) return;
  if (!currentSceneId.value) return;
  dialogues.value = await listSpDialogueService(screenplay.value.id, currentSceneId.value);
}

const onChangeScene = (scene: SpScene) => {
  currentSceneId.value = scene.id
}

onMounted(async () => {
  screenplay.value = await getScreenplayService(route.params.id as string);
  await Promise.all([
    fetchRoles(),
    fetchScenes(),
    fetchRoleAppearance()
  ])
  // 当前场景
  currentSceneId.value = scenes.value[scenes.value.length - 1]?.id;
  console.log(scenes.value, currentSceneId.value)
  // 获取聊天记录
  await fetchDialogue();
})

const refreshScene = async () => {
  // 重新获取场景
  await fetchScenes();
  // 当前场景
  currentSceneId.value = scenes.value[scenes.value.length - 1]?.id;
  // 获取聊天记录
  await fetchDialogue();
}
</script>

<style scoped lang="less">
.screenplay-container {
  display: flex;
  height: 100vh;
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
