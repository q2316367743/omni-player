<template>
  <div class="app-home-container">
    <div class="home-header">
      <h1 class="home-title">实用工具箱</h1>
      <p class="home-subtitle">高效便捷的在线工具集合</p>
    </div>

    <div class="tools-section">
      <div class="section-title">本地工具</div>
      <div class="tools-grid">
        <div class="tool-card" @click="jumpTool('regex')">
          <div class="tool-icon regex">
            <t-icon name="code" />
          </div>
          <div class="tool-info">
            <div class="tool-name">正则表达式</div>
            <div class="tool-desc">测试和调试正则表达式</div>
          </div>
        </div>

        <div class="tool-card" @click="jumpTool('http')">
          <div class="tool-icon http">
            <t-icon name="internet" />
          </div>
          <div class="tool-info">
            <div class="tool-name">简单请求</div>
            <div class="tool-desc">快速发送 HTTP 请求</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tools-section">
      <div class="section-title">媒体工具</div>
      <div class="tools-grid">
        <div class="tool-card" @click="jumpTool('qushuiyin')">
          <div class="tool-icon media">
            <t-icon name="video" />
          </div>
          <div class="tool-info">
            <div class="tool-name">去水印</div>
            <div class="tool-desc">视频图片水印去除</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();

const jumpTool = (model: string) => router.push(`/app/tool/${model}`);
</script>

<style scoped lang="less">
.app-home-container {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: var(--td-bg-color-container);
}

.home-header {
  text-align: center;
  margin-bottom: 32px;

  .home-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 8px 0;
  }

  .home-subtitle {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    margin: 0;
  }
}

.tools-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: 16px;
    padding-left: 4px;
    border-left: 3px solid var(--td-brand-color);
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

.tool-card {
  background: var(--td-bg-color-container);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--td-border-level-1-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--td-brand-color);
  }

  .tool-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    flex-shrink: 0;

    &.regex {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    &.http {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    &.media {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }
  }

  .tool-info {
    flex: 1;
    min-width: 0;

    .tool-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin-bottom: 4px;
    }

    .tool-desc {
      font-size: 13px;
      color: var(--td-text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

@media (max-width: 768px) {
  .app-home-container {
    padding: 16px;
  }

  .home-header {
    margin-bottom: 24px;

    .home-title {
      font-size: 24px;
    }
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
