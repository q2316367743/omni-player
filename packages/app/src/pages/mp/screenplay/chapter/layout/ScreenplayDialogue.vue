<template>
  <div class="screenplay-dialogue-container">
    <div v-for="content in contents" :key="content.id" class="content">
      <t-textarea autosize :disabled="content.scene_id !== sceneId" :value="content.content"
                  @change="handleSave(content.id, `${$event}`)"/>
    </div>
  </div>
</template>
<script lang="ts" setup>

import type {SpChapterContent} from "@/entity/screenplay";
import {listSpChapterContentService, updateSpChapterContent} from "@/services/screenplay";
import {debounce} from "es-toolkit";

const props = defineProps({
  chapterId: {
    type: String,
    required: true
  },
  sceneId: {
    type: String,
    required: true
  }
});
const contents = ref(new Array<SpChapterContent>())

watch(() => props.chapterId, async (val) => {
  contents.value = await listSpChapterContentService(val);
});

const handleSave = debounce(async (id: string, content: string) => {
  await updateSpChapterContent(id, content);
}, 300);

</script>
<style scoped lang="less">
@import "less/ScreenplayDialogue.less";
</style>
