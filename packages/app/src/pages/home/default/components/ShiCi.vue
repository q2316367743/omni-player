<template>
  <div>{{ ShiCiText }}</div>
</template>
<script lang="ts" setup>
import * as jrsc from 'jinrishici';
import {LocalName} from "@/global/LocalName.ts";

const shiCiTime = useLocalStorage(LocalName.PAGE_HOME_SHI_CI_TIME, 0);
const ShiCiText = useLocalStorage(LocalName.PAGE_HOME_SHI_CI_TEXT, "");

onMounted(() => {
  if (Date.now() - shiCiTime.value > 60 * 60 * 1000) {
    jrsc.load(function (result) {
      ShiCiText.value = `${Array.isArray(result.data.content) ? result.data.content.join('；') : result.data.content} -- ${result.data.origin.author}`;
      shiCiTime.value = Date.now();
    });
  }
})
</script>
<style scoped lang="less">
</style>
