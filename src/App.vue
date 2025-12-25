<template>
  <t-layout class="abs-0 overflow-hidden">
    <t-aside :width="collapsed ? '0' : '232px'">
      <app-aside/>
    </t-aside>
    <t-content class="h-full relative">
      <router-view/>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {collapsed} from "@/global/Constants.ts";
</script>
<style lang="less">
</style>
