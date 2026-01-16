<template>
  <t-layout class="w-full h-full overflow-hidden">
    <t-aside class="h-full overflow-hidden shrink-0" :width="showAside ? '232px' : '0px'">
      <roundtable-aside v-model="activeKey" ref="aside" @toggle-collapsed="toggleCollapsed()"/>
    </t-aside>
    <t-content class="h-full overflow-hidden overflow-x-hidden relative">
      <roundtable-role v-show="activeKey === '/role'" :collapsed="collapsed"
                       @toggle-collapsed="toggleCollapsed()"/>
      <roundtable-group v-if="activeKey === '/group'" :collapsed="collapsed"
                        @toggle-collapsed="toggleCollapsed()"/>
      <roundtable-meeting v-else-if="activeKey.startsWith('/meeting')" v-model="activeKey" :collapsed="collapsed"
                          @toggle-collapsed="toggleCollapsed()"/>
      <roundtable-create v-else-if="activeKey.startsWith('/create')" v-model="activeKey" :collapsed="collapsed"
                         @toggle-collapsed="toggleCollapsed()" @refresh="onRefreshMeeting"/>
      <empty-result v-else-if="activeKey !== '/role'" title="AI 圆桌派" tip="让 AI 与你一起头脑风暴">
        <t-button theme="primary" @click="activeKey = '/create/0'">创建圆桌会议</t-button>
      </empty-result>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import RoundtableAside from "@/pages/app/ai/roundtable/components/RoundtableAside.vue";
import RoundtableRole from "@/pages/app/ai/roundtable/pages/role/roundtable-role.vue";
import RoundtableGroup from "@/pages/app/ai/roundtable/pages/group/roundtable-group.vue";
import RoundtableMeeting from "@/pages/app/ai/roundtable/pages/meeting/roundtable-meeting.vue";
import RoundtableCreate from "@/pages/app/ai/roundtable/pages/create/roundtable-create.vue";

const activeKey = ref('');
const aside = ref();
const collapsed = ref(false);

const showAside = computed(() => {
  if (!activeKey.value) return true;
  return !collapsed.value
})

const toggleCollapsed = useToggle(collapsed);

const onRefreshMeeting = () => {
  aside.value.refreshMeeting()
}
</script>
<style scoped lang="less">

</style>
