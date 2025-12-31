<template>
  <div class="note-editor-container">
    <div ref="cherryRef" class="cherry-container"></div>
  </div>
</template>

<script lang="ts" setup>
import {NoteFs} from "../func/noteFs.ts";
import {useCherryMarkdown, type UseCherryMarkdownResult} from "@/hooks";

interface Props {
  articlePath: string;
  noteFs: NoteFs;
}

const props = defineProps<Props>();

const cherryRef = ref<HTMLDivElement>();
let cherry: UseCherryMarkdownResult | null = null;

const initCherry = async () => {
  if (!cherryRef.value) return;

  cherry = await useCherryMarkdown({
    noteFs: props.noteFs,
    articlePath: props.articlePath,
    el: cherryRef.value
  });
};

onMounted(() => {
  watch(() => props.articlePath, () => {
    if (cherry) {
      cherry.destroy();
      cherry = null;
    }
    initCherry();
  }, {immediate: true});
});

onBeforeUnmount(() => {
  cherry?.destroy();
  cherry = null;
});

</script>

<style scoped lang="less">
.note-editor-container {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .cherry-container {
    height: 100%;
    width: 100%;
  }
}
</style>
