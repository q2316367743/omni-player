<template>
  <div class="screenplay-container">

    <screenplay-role v-if="screenplay" :roles="roles" :screenplay="screenplay" @refresh="fetchRoles"/>

    <main class="main-content">
      <screenplay-scene :scenes="scenes" :current-scene-id="currentSceneId" @select="onChangeScene"/>

      <div class="chat-container">

        <screenplay-dialogue :role-map="roleMap" :dialogues="dialogues"/>

        <div class="control-panel">
          <t-space size="small" break-line>
            <t-button theme="primary" @click="enterScene">
              <template #icon>
                <login-icon/>
              </template>
              进入场景
            </t-button>
            <t-button theme="warning" variant="outline" @click="triggerEvent">
              <template #icon>
                <error-circle-icon/>
              </template>
              突发事件
            </t-button>
            <t-button theme="default" @click="advanceStory">
              <template #icon>
                <chevron-right-icon/>
              </template>
              推进剧情
            </t-button>
            <t-button theme="default" variant="outline" @click="pauseStory">
              <template #icon>
                <pause-circle-icon/>
              </template>
              暂停
            </t-button>
            <t-button theme="default" variant="dashed" @click="addScene">
              <template #icon>
                <add-icon/>
              </template>
              新场景
            </t-button>
          </t-space>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, onMounted} from 'vue'
import type {SpRole, SpScene, SpDialogue, Screenplay} from '@/entity/screenplay'
import {
  AddIcon,
  LoginIcon,
  ErrorCircleIcon,
  ChevronRightIcon,
  PauseCircleIcon
} from 'tdesign-icons-vue-next'
import ScreenplayRole from "@/pages/screenplay/components/ScreenplayRole.vue";
import ScreenplayScene from "@/pages/screenplay/components/ScreenplayScene.vue";
import {map} from "@/util";
import ScreenplayDialogue from "@/pages/screenplay/components/ScreenplayDialogue.vue";
import {getScreenplayService, listSpRoleService} from "@/services/screenplay";

const route = useRoute();

const screenplay = ref<Screenplay>();
const roles = ref<SpRole[]>([])
const roleMap = ref(new Map<string, SpRole>());
const scenes = ref<SpScene[]>([])
const dialogues = ref<SpDialogue[]>([])
const currentSceneId = ref<string>('')

const currentScene = computed(() => scenes.value.find(s => s.id === currentSceneId.value));

const fetchRoles = async () => {
  if (!screenplay.value) return;
  roles.value = await listSpRoleService(screenplay.value.id);
  roleMap.value = map(roles.value, 'id');
}

const enterScene = () => {
  console.log('Enter scene:', currentScene.value)
}

const triggerEvent = () => {
  console.log('Trigger event')
}

const advanceStory = () => {
  console.log('Advance story')
}

const pauseStory = () => {
  console.log('Pause story')
}

const addScene = () => {
  console.log('Add scene')
}

const onChangeScene = (scene: SpScene) => {
  currentSceneId.value = scene.id
}

onMounted(async () => {

  screenplay.value = await getScreenplayService(route.params.id as string);
  await fetchRoles();


  scenes.value = [
    {
      id: '1',
      screenplay_id: '1',
      name: '市政厅会议室',
      description: '清晨，阳光透过落地窗洒在会议桌上',
      order_index: 1,
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '2',
      screenplay_id: '1',
      name: '科技公司办公室',
      description: '深夜，办公室灯火通明',
      order_index: 2,
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '3',
      screenplay_id: '1',
      name: '城市广场',
      description: '黄昏，人群熙熙攘攘',
      order_index: 3,
      created_at: Date.now(),
      updated_at: Date.now()
    }
  ]

  dialogues.value = [
    {
      id: '1',
      screenplay_id: '1',
      scene_id: '1',
      turn_order: 1,
      type: 'narrator',
      role_id: '3',
      action: '故事开始',
      dialogue: '这是一个关于AI与人性的故事...',
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '2',
      screenplay_id: '1',
      scene_id: '1',
      turn_order: 2,
      type: 'role',
      role_id: '1',
      action: '攥紧拳头',
      dialogue: '我们必须做出决定。',
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: '3',
      screenplay_id: '1',
      scene_id: '1',
      turn_order: 3,
      type: 'role',
      role_id: '2',
      action: '来回踱步',
      dialogue: '但这太冒险了！',
      created_at: Date.now(),
      updated_at: Date.now()
    }
  ]
  roleMap.value = map(roles.value, 'id');
  currentSceneId.value = scenes.value[0]!.id
})
</script>

<style scoped lang="less">
.screenplay-container {
  display: flex;
  height: 100vh;
  background: var(--td-bg-color-container);
  font-family: var(--td-font-family), serif;
  overflow: hidden;
}

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


.control-panel {
  padding: 20px 24px;
  background: var(--fluent-acrylic-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-top: 1px solid var(--fluent-border-subtle);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--td-scroll-track-color);
  border-radius: var(--td-radius-default);
}

::-webkit-scrollbar-thumb {
  background: var(--td-scrollbar-color);
  border-radius: var(--td-radius-default);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--td-scrollbar-hover-color);
}
</style>
