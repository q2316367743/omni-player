<template>
  <div class="shici-container">
    <div class="shici-card">
      <div class="shici-content">
        <div class="shici-text">{{ ShiCiText }}</div>
      </div>
      <div class="shici-footer">
        <span class="shici-label">今日诗词</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import * as jrsc from 'jinrishici';
import {LocalName} from "@/global/LocalName.ts";

const shiCiTime = useLocalStorage(LocalName.PAGE_HOME_SHI_CI_TIME, 0);
const ShiCiText = useLocalStorage(LocalName.PAGE_HOME_SHI_CI_TEXT, "");

onMounted(() => {
  if (Date.now() - shiCiTime.value > 60*60*1000) {
    jrsc.load(function (result) {
      ShiCiText.value = result.data.content;
      shiCiTime.value = Date.now();
    });
  }
})
</script>
<style scoped lang="less">
.shici-container {
  position: fixed;
  bottom: 32px;
  right: 8px;
  z-index: 100;
}

.shici-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
}

.shici-content {
  text-align: center;
  padding: 12px 0;
}

.shici-text {
  font-size: 16px;
  line-height: 1.8;
  color: #2c3e50;
  font-weight: 500;
  letter-spacing: 0.05em;
  white-space: pre-wrap;
}

.shici-footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.shici-label {
  font-size: 11px;
  color: #7f8c8d;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .shici-container {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }

  .shici-card {
    padding: 20px 16px;
    max-width: none;
  }

  .shici-text {
    font-size: 14px;
  }
}
</style>
