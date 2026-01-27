<template>
  <div class="toolbox-page">
    <div class="toolbox-content">
      <div class="tools-group">
        <div class="group-title">
          <t-icon name="star" size="20px"/>
          <span>常用工具</span>
        </div>
        <div class="tools-grid">
          <ghibli-tool-card value="todo" label="待办" desc="井井有条" tone="todo">
            <template #icon>
              <check-rectangle-icon/>
            </template>
          </ghibli-tool-card>
          <ghibli-tool-card value="editor" label="笔记" desc="妙笔生花" tone="editor">
            <template #icon>
              <edit1-icon/>
            </template>
          </ghibli-tool-card>
          <ghibli-tool-card value="bookkeeping" label="记账" desc="精打细算" tone="media">
            <template #icon>
              <money-icon/>
            </template>
          </ghibli-tool-card>
        </div>
      </div>

      <div class="tools-group">
        <div class="group-title">
          <t-icon name="chat" size="20px"/>
          <span>AI 助手</span>
        </div>
        <div class="tools-grid mini-tools-grid">
          <ghibli-mini-tool-card label="聊天" value="ai/chat" tone="ai">
            <template #icon>
              <chat-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card label="圆桌会" value="ai/roundtable" tone="ai">
            <template #icon>
              <usergroup-icon/>
            </template>
          </ghibli-mini-tool-card>
        </div>
      </div>

      <div class="tools-group">
        <div class="group-title">
          <t-icon name="code" size="20px"/>
          <span>开发工具</span>
        </div>
        <div class="tools-grid mini-tools-grid">
          <ghibli-mini-tool-card value="programmer/regex" label="正则表达式" tone="regex">
            <template #icon>
              <code-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card value="programmer/http" label="简单请求" tone="http">
            <template #icon>
              <internet-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card value="programmer/nginx" label="nginx" tone="regex">
            <template #icon>
              <internet-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card value="programmer/release" label="发版助手" tone="regex">
            <template #icon>
              <git-merge-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card value="programmer/snippet" label="代码片段" tone="regex">
            <template #icon>
              <code1-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card value="programmer/command" label="命令助手" tone="disabled">
            <template #icon>
              <command-icon/>
            </template>
          </ghibli-mini-tool-card>
        </div>
      </div>

      <div class="tools-group">
        <div class="group-title">
          <t-icon name="internet" size="20px"/>
          <span>在线服务</span>
        </div>
        <div class="tools-grid mini-tools-grid">
          <ghibli-mini-tool-card value="fanyi" label="在线翻译" tone="online">
            <template #icon>
              <translate-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card value="dailyhot" label="今日热搜" tone="online">
            <template #icon>
              <article-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card value="qushuiyin" label="去水印" tone="disabled">
            <template #icon>
              <video-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card value="online/image" label="随机图片" tone="disabled">
            <template #icon>
              <image-icon/>
            </template>
          </ghibli-mini-tool-card>
        </div>
      </div>

      <div class="tools-group">
        <div class="group-title">
          <t-icon name="setting" size="20px"/>
          <span>系统工具</span>
        </div>
        <div class="tools-grid mini-tools-grid">
          <ghibli-mini-tool-card label="端口扫描" value="system/port" tone="todo">
            <template #icon>
              <portrait-icon/>
            </template>
          </ghibli-mini-tool-card>
          <ghibli-mini-tool-card v-if="showHomebrew" label="Homebrew" value="system/homebrew" tone="todo">
            <template #icon>
              <HomebrewIcon/>
            </template>
          </ghibli-mini-tool-card>
        </div>
      </div>
    </div>

    <div class="page-decoration">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
      <div class="star star-1"></div>
      <div class="star star-2"></div>
      <div class="star star-3"></div>
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
import GhibliToolCard from "./GhibliToolCard.vue";
import GhibliMiniToolCard from "./GhibliMiniToolCard.vue";
import HomebrewIcon from "@/pages/home/default/icon/HomebrewIcon.vue";
import {platform} from "@tauri-apps/plugin-os";

const p = platform();
const showHomebrew = (p === "macos" || p === "linux");
</script>

<style scoped lang="less">
.toolbox-page {
  width: calc(100vw - 32px);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 66px 16px 16px 16px;
  position: relative;
  overflow: hidden;
}

.toolbox-content {
  width: 100%;
  max-width: 1200px;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s ease-out;
  overflow-y: auto;
  max-height: calc(100vh - 82px);
  padding-right: 10px;
  padding-left: 10px;

  &::-webkit-scrollbar {
    display: none;
    visibility: hidden;
  }
}

.tools-group {
  margin-bottom: 24px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 12px;
  font-family: 'LXGW WenKai', 'KaiTi', '楷体', serif;

  :deep(.t-icon) {
    color: var(--td-brand-color);
  }
}

.tools-grid {
  display: grid;
  gap: 12px;

  &:not(.mini-tools-grid) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  &.mini-tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

.page-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float 20s ease-in-out infinite;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: inherit;
    border-radius: 50%;
  }

  &.cloud-1 {
    width: 150px;
    height: 75px;
    top: 10%;
    right: 10%;
    animation-delay: 0s;

    &::before {
      width: 60px;
      height: 60px;
      top: -30px;
      left: 25px;
    }

    &::after {
      width: 85px;
      height: 85px;
      top: -42px;
      left: 60px;
    }
  }

  &.cloud-2 {
    width: 120px;
    height: 60px;
    top: 30%;
    left: 5%;
    animation-delay: 7s;

    &::before {
      width: 50px;
      height: 50px;
      top: -25px;
      left: 18px;
    }

    &::after {
      width: 70px;
      height: 70px;
      top: -35px;
      left: 50px;
    }
  }

  &.cloud-3 {
    width: 100px;
    height: 50px;
    bottom: 15%;
    right: 20%;
    animation-delay: 14s;

    &::before {
      width: 40px;
      height: 40px;
      top: -20px;
      left: 15px;
    }

    &::after {
      width: 55px;
      height: 55px;
      top: -27px;
      left: 35px;
    }
  }
}

.star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffd700;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
  box-shadow: 0 0 6px 2px rgba(255, 215, 0, 0.5);

  &.star-1 {
    top: 15%;
    left: 15%;
    animation-delay: 0s;
  }

  &.star-2 {
    top: 25%;
    right: 25%;
    animation-delay: 1s;
  }

  &.star-3 {
    bottom: 25%;
    left: 25%;
    animation-delay: 2s;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-15px) translateX(10px);
  }
  50% {
    transform: translateY(-8px) translateX(-10px);
  }
  75% {
    transform: translateY(-20px) translateX(5px);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
