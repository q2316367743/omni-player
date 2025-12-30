<template>
  <div class="h-full w-full" ref="webviewRef"/>
</template>
<script lang="ts" setup>
import {webviewManager} from "@/lib/webview.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";

const props = defineProps({
  url: {
    type: String,
    required: true
  }
});

const webviewRef = useTemplateRef('webviewRef');
const webviewLabel = ref(`subscribe-webview-${Date.now()}`);


async function createWebview() {
  if (!webviewRef.value || !props.url) return;

  const rect = webviewRef.value.getBoundingClientRect();

  try {
    await webviewManager.createWebview({
      label: webviewLabel.value,
      url: props.url,
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    });

    webviewManager.startObserving(webviewRef.value, async (position) => {
      await webviewManager.updatePosition({...position, height: position.height + 32});
    });
  } catch (e) {
    console.error('Failed to create webview:', e);
    MessageUtil.error("创建网页视图失败", e);
  }
}

async function destroyWebview() {
  try {
    await webviewManager.destroyWebview();
  } catch (e) {
    console.error('Failed to destroy webview:', e);
  }
}

onMounted(() => {
  createWebview();
})
onBeforeMount(() => {
  destroyWebview();
})
watch(() => props.url, () => {
  destroyWebview();
  createWebview();
})
</script>
<style scoped lang="less">

</style>
