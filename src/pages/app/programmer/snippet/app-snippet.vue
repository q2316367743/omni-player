<template>
  <t-layout class="snippet-page">
    <snippet-sidebar
      ref="sidebarRef"
      :current-snippet-id="currentSnippet?.id"
      @select="handleSelectSnippet"
    />

    <snippet-content
      ref="contentRef"
      @deleted="handleSnippetDeleted"
      @renamed="handleSnippetRenamed"
    />
  </t-layout>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import type {SnippetMetaWithTag} from '@/services/SnippetService';
import SnippetSidebar from './components/SnippetSidebar.vue';
import SnippetContent from './components/SnippetContent.vue';

type SidebarInstance = InstanceType<typeof SnippetSidebar> & {
  refresh: () => void;
};

type ContentInstance = InstanceType<typeof SnippetContent> & {
  loadSnippet: (id: string) => void;
};

const sidebarRef = ref<SidebarInstance>();
const contentRef = ref<ContentInstance>();

const currentSnippet = ref<SnippetMetaWithTag>();

const handleSelectSnippet = (snippet: SnippetMetaWithTag) => {
  if (currentSnippet.value?.id === snippet.id) {
    currentSnippet.value = undefined;
    contentRef.value?.loadSnippet(undefined);
    return;
  }
  currentSnippet.value = snippet;
  contentRef.value?.loadSnippet(snippet.id);
};

const handleSnippetDeleted = () => {
  currentSnippet.value = undefined;
  sidebarRef.value?.refresh();
};

const handleSnippetRenamed = (name: string) => {
  if (currentSnippet.value) {
    currentSnippet.value.name = name;
  }
};
</script>

<style scoped lang="less">
.snippet-page {
  height: 100%;
  overflow: hidden;
}
</style>
