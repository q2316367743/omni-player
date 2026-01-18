<template>
  <div class="screenplay-container">

    <screenplay-role v-if="screenplay" :roles="roles" :screenplay="screenplay" :current-scene-id="currentSceneId" :role-appearance-map="roleAppearanceMap"
                     :role-map="roleMap" :loading-role-ids="loadingRoleIds" @refresh="fetchRoles"/>

    <main class="main-content">
      <screenplay-scene :scenes="scenes" :current-scene-id="currentSceneId" :role-appearance-map="roleAppearanceMap"
                        :role-map="roleMap" @select="onChangeScene"/>

      <div class="chat-container">

        <screenplay-dialogue :role-map="roleMap" :dialogues="dialogues"/>

        <screenplay-control v-if="screenplay" :screenplay="screenplay" :scenes :current-scene-id="currentSceneId"
                            :pause="isPause"
                            @refresh-scene="refreshScene" @refresh-role-appearance="fetchRoleAppearance"
                            @refresh-dialogue="fetchDialogue" @pause-toggle="toggleAutoPlay"/>
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
import {AutoPlayManager} from "@/modules/ai/AutoPlayManager.ts";

const route = useRoute();

const isPause = ref(true);
const screenplay = ref<Screenplay>();
const roles = ref<SpRole[]>([])
const roleMap = ref(new Map<string, SpRole>());
const scenes = ref<SpScene[]>([])
const dialogues = ref<SpDialogue[]>([])
const currentSceneId = ref<string>();
const loadingRoleIds = ref<string[]>([]);
const autoPlayManager = ref<AutoPlayManager | null>(null);
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

const toggleAutoPlay = () => {
  if (!autoPlayManager.value) return;
  
  if (isPause.value) {
    autoPlayManager.value.resume();
    isPause.value = false;
  } else {
    autoPlayManager.value.pause();
    isPause.value = true;
  }
}

const initAutoPlayManager = () => {
  if (!screenplay.value || !currentSceneId.value) return;
  
  const director = roles.value.find(r => r.type === 'decision');
  const narrator = roles.value.find(r => r.type === 'narrator');
  
  if (!director || !narrator) {
    console.error('Director or narrator role not found');
    return;
  }
  
  const currentScene = scenes.value.find(s => s.id === currentSceneId.value);
  if (!currentScene) return;
  
  autoPlayManager.value = new AutoPlayManager({
    screenplay: screenplay.value,
    currentScene: currentScene,
    scenes: scenes.value,
    roles: roles.value,
    roleMap: roleMap.value,
    director: director,
    narrator: narrator,
    maxSceneTurns: 20,
    onLoadingPush: (ids) => {
      loadingRoleIds.value.push(...ids);
    },
    onLoadingPop: (ids) => {
      loadingRoleIds.value = loadingRoleIds.value.filter(id => !ids.includes(id));
    },
    onDialogueUpdate: async () => {
      await fetchDialogue();
    },
    onSceneChange: async (sceneId) => {
      currentSceneId.value = sceneId;
      await fetchDialogue();
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (autoPlayManager.value && !isPause.value) {
        const newScene = scenes.value.find(s => s.id === sceneId);
        if (newScene) {
          await autoPlayManager.value.updateScene(newScene);
          await autoPlayManager.value.resume();
        }
      }
    },
    onPause: () => {
      isPause.value = true;
    },
    getDialogues: async () => {
      // 获取全部角色对话
      return dialogues.value.filter(e => e.type === 'role');
    },
    getRoleAppearances: async (sceneId: string) => {
      return roleAppearanceMap.value.getOrDefault(sceneId, []);
    }
  });
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
  // 初始化自动演绎管理器
  initAutoPlayManager();
})

const refreshScene = async () => {
  // 重新获取场景
  await fetchScenes();
  // 当前场景
  currentSceneId.value = scenes.value[scenes.value.length - 1]?.id;
  // 获取聊天记录
  await fetchDialogue();
  // 重新初始化自动演绎管理器
  initAutoPlayManager();
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
