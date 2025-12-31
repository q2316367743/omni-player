<template>
  <div class="tools-container">
    <div class="tools-group">
      <div class="group-title">程序员三件套</div>
      <div class="tools-grid">
        <div class="tool-card" @click="jumpTool('todo')">
          <div class="tool-icon todo">
            <check-rectangle-icon />
          </div>
          <div class="tool-info">
            <div class="tool-name">待办</div>
            <div class="tool-desc">井井有条</div>
          </div>
        </div>
        <div class="tool-card" @click="jumpTool('editor')">
          <div class="tool-icon editor">
            <edit1-icon />
          </div>
          <div class="tool-info">
            <div class="tool-name">笔记</div>
            <div class="tool-desc">妙笔生花</div>
          </div>
        </div>
        <div class="tool-card" @click="jumpTool('bookkeeping')">
          <div class="tool-icon editor">
            <money-icon />
          </div>
          <div class="tool-info">
            <div class="tool-name">记账</div>
            <div class="tool-desc">精打细算</div>
          </div>
        </div>
      </div>
    </div>
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
        <div class="tool-card" @click="jumpTool('dailyhot')">
          <div class="tool-icon media">
            <article-icon/>
          </div>
          <div class="tool-info">
            <div class="tool-name">今日热搜</div>
            <div class="tool-desc">查看各大榜单的今日热榜排行</div>
          </div>
        </div>
        <div class="tool-card" @click="jumpTool('qushuiyin')">
          <div class="tool-icon media">
            <video-icon/>
          </div>
          <div class="tool-info">
            <div class="tool-name">去水印</div>
            <div class="tool-desc">视频图片水印去除</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tools-group">
      <div class="group-title">系统工具</div>
      <div class="tools-grid">
        <div class="tool-card" @click="jumpTool('system/port')">
          <div class="tool-icon media">
            <portrait-icon />
          </div>
          <div class="tool-info">
            <div class="tool-name">端口扫描</div>
            <div class="tool-desc">看看哪个端口在占用</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ArticleIcon,
  CheckRectangleIcon,
  CodeIcon, Edit1Icon,
  InternetIcon, MoneyIcon, PortraitIcon,
  TranslateIcon,
  VideoIcon
} from "tdesign-icons-vue-next";

const router = useRouter();

const jumpTool = (model: string) => router.push(`/app/tool/${model}`);
</script>

<style scoped lang="less">
@import "../home-index.less";
</style>
