<template>
  <div class="tools-container">
    <div class="tools-group">
      <div class="group-title">本地工具</div>
      <div class="tools-grid">
        <div class="tool-card" @click="jumpTool('regex')">
          <div class="tool-icon regex">
            <code-icon/>
          </div>
          <div class="tool-info">
            <div class="tool-name">正则表达式</div>
            <div class="tool-desc">测试和调试正则表达式</div>
          </div>
        </div>
        <div class="tool-card" @click="jumpTool('http')">
          <div class="tool-icon http">
            <internet-icon/>
          </div>
          <div class="tool-info">
            <div class="tool-name">简单请求</div>
            <div class="tool-desc">快速发送 HTTP 请求</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tools-group">
      <div class="group-title">在线工具</div>
      <div class="tools-grid">
        <div class="tool-card" @click="jumpTool('fanyi')">
          <div class="tool-icon online">
            <translate-icon/>
          </div>
          <div class="tool-info">
            <div class="tool-name">在线翻译</div>
            <div class="tool-desc">在线双向翻译</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tools-group">
      <div class="group-title">媒体工具</div>
      <div class="tools-grid">
        <div class="tool-card" @click="jumpTool('qushuiyin')">
          <div class="tool-icon media">
            <video-icon/>
          </div>
          <div class="tool-info">
            <div class="tool-name">去水印</div>
            <div class="tool-desc">视频图片水印去除</div>
          </div>
        </div>
        <div class="tool-card" @click="jumpTool('dailyhot')">
          <div class="tool-icon media">
            <article-icon />
          </div>
          <div class="tool-info">
            <div class="tool-name">今日热搜</div>
            <div class="tool-desc">查看各大榜单的今日热榜排行</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ArticleIcon, CodeIcon, InternetIcon, TranslateIcon, VideoIcon} from "tdesign-icons-vue-next";

const router = useRouter();

const jumpTool = (model: string) => router.push(`/app/tool/${model}`);
</script>

<style scoped lang="less">
@import "../home-index.less";
</style>
