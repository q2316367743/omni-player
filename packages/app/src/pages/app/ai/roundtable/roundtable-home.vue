<template>
  <t-layout class="w-full h-full overflow-hidden">
    <t-aside class="h-full overflow-hidden shrink-0">
      <roundtable-aside v-model="activeKey"/>
    </t-aside>
    <t-content class="h-full overflow-hidden overflow-x-hidden">
      <roundtable-role v-show="activeKey === '/role'"/>
      <roundtable-group v-if="activeKey.startsWith('/group')"/>
      <roundtable-meeting v-else-if="activeKey.startsWith('/meeting')"/>
      <roundtable-create v-else-if="activeKey.startsWith('/create')" />
      <empty-result v-else-if="activeKey !== '/role'" title="AI 圆桌派" tip="让 AI 与你一起头脑风暴"/>
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
</script>
<style scoped lang="less">

</style>
