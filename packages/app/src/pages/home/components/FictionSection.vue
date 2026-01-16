<template>
  <div class="mt-16px">
    <div class="fiction-header">
      <h3 class="fiction-title">
        <edit1-icon class="title-icon"/>
        剧本杀创作
      </h3>
      <div class="flex gap-4px">
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <refresh-icon/>
          </template>
        </t-button>
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <add-icon/>
          </template>
        </t-button>
      </div>
    </div><div class="fiction-header">
    <h3 class="fiction-title">
      <edit1-icon class="title-icon"/>
      小说创作
    </h3>
    <div class="flex gap-4px">
      <t-button theme="primary" variant="text" shape="square">
        <template #icon>
          <refresh-icon/>
        </template>
      </t-button>
      <t-button theme="primary" variant="text" shape="square">
        <template #icon>
          <add-icon/>
        </template>
      </t-button>
    </div>
  </div>
  </div>
</template>
<script lang="ts" setup>
import {AddIcon, Edit1Icon, RefreshIcon} from "tdesign-icons-vue-next";
</script>
<style scoped lang="less">
.fiction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--td-size-5);

  .fiction-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--td-size-3);
    letter-spacing: -0.3px;

    .title-icon {
      font-size: 22px;
      color: var(--td-brand-color);
    }
  }
}
</style>
