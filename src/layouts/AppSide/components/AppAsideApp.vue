<template>
  <div class="nav-group">
    <div class="group-title">
      <span> APP</span>
    </div>
    <div :class="{'nav-item': true, active: activeKey === '/app/regex'}" @click="jumpTo('regex')">
      <div class="nav-item-content">
        <code-icon class="nav-icon"/>
        <span class="nav-text">正则</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {CodeIcon} from "tdesign-icons-vue-next";

defineProps({
  activeKey: String
});

const router = useRouter();

const jumpTo = (module: string) => router.push(`/app/${module}`)
</script>
<style scoped lang="less">

</style>
