<template>
  <div class="tools-page-container">
    <div class="tools-header">
      <h2 class="tools-title">🧰 工具箱</h2>
      <p class="tools-subtitle">常用工具集合，提升效率</p>
    </div>
    
    <div class="tools-content">
      <div class="tools-group">
        <div class="group-title">程序员三件套</div>
        <div class="tools-grid">
          <ToolCard value="todo" label="待办" desc="井井有条" tone="media">
            <template #icon>
              <check-rectangle-icon/>
            </template>
          </ToolCard>
          <ToolCard value="editor" label="笔记" desc="妙笔生花" tone="media">
            <template #icon>
              <edit1-icon/>
            </template>
          </ToolCard>
          <ToolCard value="bookkeeping" label="记账" desc="精打细算" tone="media">
            <template #icon>
              <money-icon/>
            </template>
          </ToolCard>
        </div>
      </div>

      <div class="tools-group">
        <div class="group-title">AI 工具</div>
        <div class="tools-grid mini-tools-grid">
          <MiniToolCard label="聊天" value="ai/chat" tone="ai">
            <template #icon>
              <chat-icon />
            </template>
          </MiniToolCard>
          <MiniToolCard label="圆桌会" value="ai/roundtable" tone="ai">
            <template #icon>
              <usergroup-icon />
            </template>
          </MiniToolCard>
        </div>
      </div>

      <div class="tools-group">
        <div class="group-title">程序员套件</div>
        <div class="tools-grid mini-tools-grid">
          <MiniToolCard value="programmer/regex" label="正则表达式" tone="regex">
            <template #icon>
              <code-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard value="programmer/http" label="简单请求" tone="regex">
            <template #icon>
              <internet-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard value="programmer/nginx" label="nginx" tone="regex">
            <template #icon>
              <internet-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard value="programmer/release" label="发版助手" tone="regex">
            <template #icon>
              <git-merge-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard value="programmer/snippet" label="代码片段" tone="regex">
            <template #icon>
              <code1-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard value="programmer/command" label="命令助手" tone="disabled">
            <template #icon>
              <command-icon/>
            </template>
          </MiniToolCard>
        </div>
      </div>

      <div class="tools-group">
        <div class="group-title">在线工具</div>
        <div class="tools-grid mini-tools-grid">
          <MiniToolCard value="fanyi" label="在线翻译" desc="在线双向翻译" tone="online">
            <template #icon>
              <translate-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard value="dailyhot" label="今日热搜" desc="查看各大榜单的今日热榜排行" tone="online">
            <template #icon>
              <article-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard value="qushuiyin" label="去水印" desc="视频图片水印去除" tone="disabled">
            <template #icon>
              <video-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard value="online/image" label="随机图片" desc="随机图片" tone="disabled">
            <template #icon>
              <image-icon/>
            </template>
          </MiniToolCard>
        </div>
      </div>

      <div class="tools-group">
        <div class="group-title">系统工具</div>
        <div class="tools-grid mini-tools-grid">
          <MiniToolCard label="端口扫描" value="system/port" tone="todo">
            <template #icon>
              <portrait-icon/>
            </template>
          </MiniToolCard>
          <MiniToolCard v-if="showHomebrew" label="Homebrew" value="system/homebrew" tone="todo">
            <template #icon>
              <HomebrewIcon/>
            </template>
          </MiniToolCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ArticleIcon, ChatIcon,
  CheckRectangleIcon, Code1Icon,
  CodeIcon, CommandIcon, Edit1Icon, GitMergeIcon, ImageIcon,
  InternetIcon, MoneyIcon, PortraitIcon,
  TranslateIcon, UsergroupIcon,
  VideoIcon
} from "tdesign-icons-vue-next";
import ToolCard from "@/pages/home/default/components/ToolCard.vue";
import MiniToolCard from "@/pages/home/default/components/MiniToolCard.vue";
import HomebrewIcon from "@/pages/home/default/icon/HomebrewIcon.vue";
import {platform} from "@tauri-apps/plugin-os";

const p = platform();
const showHomebrew = (p === "macos" || p === "linux");
</script>

<style scoped lang="less">
.tools-page-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  background: var(--monica-warm-bg);
}

.tools-header {
  margin-bottom: 32px;
  text-align: center;
}

.tools-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--monica-coral-dark);
  margin-bottom: 8px;
}

.tools-subtitle {
  font-size: 14px;
  color: var(--monica-text-tertiary);
}

.tools-group {
  margin-bottom: 32px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--monica-text-primary);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid var(--monica-coral);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.mini-tools-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
}
</style>
