<template>
  <div class="xh-upload-image">
    <div class="image-list">
      <div
        v-for="(img, idx) in images"
        :key="idx"
        class="image-item"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <img :src="img" :alt="`image-${idx}`"/>
        <div class="delete-btn" @click="removeImage(idx)">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>
      </div>
      <div
        v-if="images.length < maxCount"
        class="upload-btn"
        :style="{ width: `${size}px`, height: `${size}px` }"
        @click="triggerUpload"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <span>上传图片</span>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      @change="handleFileChange"
      style="display: none"
    />
  </div>
</template>

<script lang="ts" setup>
import {convertFileSrc} from "@tauri-apps/api/core";
import {BaseDirectory, join} from "@tauri-apps/api/path";
import {exists, mkdir, writeFile} from "@tauri-apps/plugin-fs";
import {useSnowflake} from "@/util";
import {APP_DATA_ASSET_DIR} from "@/global/Constants.ts";

const modelValue = defineModel<string[]>({
  type: Array,
  default: () => []
})

const props = defineProps({
  folder: {
    type: String,
    default: "temp"
  },
  size: {
    type: Number,
    default: 80
  },
  maxCount: {
    type: Number,
    default: 9
  }
});

const images = computed(() => {
  return modelValue.value.map(url => /https?/.test(url) ? url : convertFileSrc(url));
});

const fileInput = ref<HTMLInputElement | null>(null);

async function uploadAttachment(file: File) {
  const fileName = `${useSnowflake().nextId()}.${file.name.split('.').pop()}`;
  const f = await join(await APP_DATA_ASSET_DIR(), props.folder);
  if (!await exists(f)) {
    await mkdir(f, {
      baseDir: BaseDirectory.AppData,
      recursive: true
    });
  }
  const attachmentPath = await join(f, fileName);
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  await writeFile(attachmentPath, uint8Array);
  return attachmentPath;
}

function triggerUpload() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    const remainingSlots = props.maxCount - modelValue.value.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    for (const file of filesToUpload) {
      const path = await uploadAttachment(file);
      modelValue.value.push(path);
    }
  }
  target.value = '';
}

function removeImage(idx: number) {
  modelValue.value.splice(idx, 1);
}
</script>

<style scoped lang="less">
.xh-upload-image {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .image-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .delete-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      background-color: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: background-color 0.2s;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }
    }
  }

  .upload-btn {
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #999;
    background-color: #fafafa;

    svg {
      width: 24px;
      height: 24px;
      margin-bottom: 4px;
    }

    span {
      font-size: 12px;
    }

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
      background-color: #f0f9ff;
    }
  }
}
</style>
