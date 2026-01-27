<template>
  <div class="tools-container">

    <div class="tools-group">
      <div class="group-title">程序员三件套</div>
      <div class="tools-grid">
        <tool-card value="todo" label="待办" desc="井井有条" tone="media">
          <template #icon>
            <check-rectangle-icon/>
          </template>
        </tool-card>
        <tool-card value="editor" label="笔记" desc="妙笔生花" tone="media">
          <template #icon>
            <edit1-icon/>
          </template>
        </tool-card>
        <tool-card value="bookkeeping" label="记账" desc="精打细算" tone="media">
          <template #icon>
            <money-icon/>
          </template>
        </tool-card>
      </div>
    </div>

    <div class="tools-group">
      <div class="group-title">AI 工具</div>
      <div class="tools-grid mini-tools-grid">
        <mini-tool-card label="聊天" value="ai/chat" tone="ai">
          <template #icon>
            <chat-icon />
          </template>
        </mini-tool-card>
        <mini-tool-card label="圆桌会" value="ai/roundtable" tone="ai">
          <template #icon>
            <usergroup-icon />
          </template>
        </mini-tool-card>
      </div>
    </div>

    <div class="tools-group">
      <div class="group-title">程序员套件</div>
      <div class="tools-grid mini-tools-grid">
        <mini-tool-card value="programmer/regex" label="正则表达式" tone="regex">
          <template #icon>
            <code-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card value="programmer/http" label="简单请求" tone="regex">
          <template #icon>
            <internet-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card value="programmer/nginx" label="nginx" tone="regex">
          <template #icon>
            <internet-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card value="programmer/release" label="发版助手" tone="regex">
          <template #icon>
            <git-merge-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card value="programmer/snippet" label="代码片段" tone="regex">
          <template #icon>
            <code1-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card value="programmer/command" label="命令助手" tone="disabled">
          <template #icon>
            <command-icon/>
          </template>
        </mini-tool-card>
      </div>
    </div>

    <div class="tools-group">
      <div class="group-title">在线工具</div>
      <div class="tools-grid mini-tools-grid">
        <mini-tool-card value="fanyi" label="在线翻译" desc="在线双向翻译" tone="online">
          <template #icon>
            <translate-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card value="dailyhot" label="今日热搜" desc="查看各大榜单的今日热榜排行" tone="online">
          <template #icon>
            <article-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card value="qushuiyin" label="去水印" desc="视频图片水印去除" tone="disabled">
          <template #icon>
            <video-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card value="online/image" label="随机图片" desc="随机图片" tone="disabled">
          <template #icon>
            <image-icon/>
          </template>
        </mini-tool-card>
      </div>
    </div>


    <div class="tools-group">
      <div class="group-title">系统工具</div>
      <div class="tools-grid mini-tools-grid">
        <mini-tool-card label="端口扫描" value="system/port" tone="todo">
          <template #icon>
            <portrait-icon/>
          </template>
        </mini-tool-card>
        <mini-tool-card v-if="showHomebrew" label="Homebrew" value="system/homebrew" tone="todo">
          <template #icon>
            <HomebrewIcon/>
          </template>
        </mini-tool-card>
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
@import "../home-index.less";

.mini-tools-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
}
</style>
