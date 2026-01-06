<template>
  <div class="tools-container">
    <div class="tools-group">
      <div class="group-title">程序员三件套</div>
      <div class="tools-grid">
        <tool-card value="todo" label="待办" desc="井井有条" cate="todo">
          <template #icon>
            <check-rectangle-icon />
          </template>
        </tool-card>
        <tool-card value="editor" label="笔记" desc="妙笔生花" cate="editor">
          <template #icon>
            <edit1-icon />
          </template>
        </tool-card>
        <tool-card value="bookkeeping" label="记账" desc="精打细算" cate="editor">
          <template #icon>
            <money-icon />
          </template>
        </tool-card>
      </div>
    </div>
    <div class="tools-group">
      <div class="group-title">程序员套件</div>
      <div class="tools-grid">


        <tool-card value="programmer/regex" label="正则表达式" desc="测试和调试正则表达式" cate="http">
          <template #icon>
            <code-icon/>
          </template>
        </tool-card>
        <tool-card value="programmer/http" label="简单请求记账" desc="快速发送 HTTP 请求" cate="http">
          <template #icon>
            <internet-icon/>
          </template>
        </tool-card>
        <tool-card value="programmer/nginx" label="nginx" desc="可视化 nginx 配置" cate="http">
          <template #icon>
            <internet-icon/>
          </template>
        </tool-card>
      </div>
    </div>

    <div class="tools-group">
      <div class="group-title">在线工具</div>
      <div class="tools-grid">
        <tool-card value="fanyi" label="在线翻译" desc="在线双向翻译" cate="online">
          <template #icon>
            <translate-icon/>
          </template>
        </tool-card>
        <tool-card value="dailyhot" label="今日热搜" desc="查看各大榜单的今日热榜排行" cate="media">
          <template #icon>
            <article-icon/>
          </template>
        </tool-card>
        <tool-card value="qushuiyin" label="去水印" desc="视频图片水印去除" cate="media">
          <template #icon>
            <video-icon/>
          </template>
        </tool-card>
      </div>
    </div>


    <div class="tools-group">
      <div class="group-title">系统工具</div>
      <div class="tools-grid">
        <tool-card label="端口扫描" value="system/port" desc="看看哪个端口在占用" cate="media">
          <template #icon>
            <portrait-icon />
          </template>
        </tool-card>
        <tool-card label="Homebrew" value="system/homebrew" desc="Homebrew 可视化" cate="todo">
          <template #icon>
            <HomebrewIcon />
          </template>
        </tool-card>
      </div>
    </div>

    <div class="tools-group">
      <div class="group-title">AI 工具</div>
      <div class="tools-grid">
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
import ToolCard from "@/pages/home/components/ToolCard.vue";
import HomebrewIcon from "@/pages/home/icon/HomebrewIcon.vue";

</script>

<style scoped lang="less">
@import "../home-index.less";
</style>
