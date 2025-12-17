<template>
  <div class="player">
    <div class="player-container">
      <video-container :url="videoUrl" @next="handleNext"/>
    </div>
    <div class="player-side">
      <div class="side-container" v-if="video">
        <div class="p-8px">
          <!-- 视频信息 -->
          <t-card class="card">
            <header class="card-header">
              <div class="space-y-3">
                <h2 class="text-2xl leading-tight ellipsis" :title="video.title">{{ video.title }}</h2>
                <div class="text-sm" v-if="video.subtitle || video.releaseYear">
                  {{ video.subtitle }} ({{ video.releaseYear }})
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="g in video.types" :key="g">
                    <t-tag theme="primary" shape="round" size="small" v-if="g">
                      {{ g }}
                    </t-tag>
                  </template>
                </div>
              </div>
            </header>
            <section class="mt-8px">
              <div class="space-y-4">
                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-bold">导演：</span>
                    <span class="text-sm">{{ video.writers.join('、') }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-bold">主演：</span>
                    <span class="text-sm">{{ video.actors.join('、') }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-bold">简介：</span>
                    <t-paragraph :ellipsis="{row: 3,expandable: true,collapsible: true}" style="margin: -14px 0">
                      <div class="text-sm text-muted-foreground mt-2 leading-relaxed" v-html="video.content"></div>
                    </t-paragraph>
                  </div>
                </div>
              </div>
            </section>
          </t-card>

          <!-- 剧集列表和推荐 -->
          <t-card class="card mt-8px">
            <t-tabs v-model="activeTab">
              <t-tab-panel label="剧集列表" value="episodes">
                <div class="space-y-2 mt-8px">
                  <t-tabs v-model="chapterTabId">
                    <t-tab-panel v-for="chapter in video.chapters" :label="chapter.name" :value="chapter.id"
                                 class="mt-8px">
                      <div class="play-items">
                        <t-tooltip v-for="(episode, i) in chapter.items" :key="episode.url" :content="episode.name">
                          <div class="play-item"
                               :class="{play: chapterId === chapter.id && index === i}"
                               @click="switchUrl(chapter.id, i)">
                            <div class=" gap-4">
                            <span v-if="chapterId === chapter.id && index === i">
                              <play-icon size="24px"/>
                            </span>
                              <span v-else>{{ (i + 1) }}</span>
                            </div>
                          </div>
                        </t-tooltip>
                      </div>
                    </t-tab-panel>
                  </t-tabs>
                </div>
              </t-tab-panel>
              <t-tab-panel label="相关推荐" value="recommendations" v-if="video.recommends.length > 0">
                <div class="space-y-4 mt-8px">
                  <div v-for="movie in video.recommends" :key="movie.id"
                       class="flex gap-4 p-3 rounded-lg  cursor-pointer transition-colors recommend">
                    <img :src="movie.cover || '/placeholder.svg'" :alt="movie.title"
                         class="w-20 h-28 object-cover rounded-md flex-shrink-0"/>
                    <div class="flex-1">
                      <h4 class="font-medium leading-tight m-0">{{ movie.title }}</h4>
                      <div class="text-sm text-muted-foreground">{{ movie.releaseDate }}</div>
                      <div class="flex items-center gap-3">
                        <t-tag theme="primary" shape="round" size="small" v-for="t in movie.types">
                          {{ t }}
                        </t-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </t-tab-panel>
            </t-tabs>
          </t-card>
        </div>
        <t-back-top container=".player-side"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {PlayIcon} from "tdesign-icons-vue-next";
import type {INetworkServer} from "@/modules/network/INetworkServer.ts";
import type {NetworkDetail} from "@/modules/network/types/NetworkDetail.ts";
import {useCacheRecordStorage} from "@/hooks";
import {LocalName} from "@/global/LocalName.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {isEmptyArray} from "@/util";

const props = defineProps({
  plugin: {
    type: Object as PropType<INetworkServer>,
    required: true
  },
  defaultNetwork: {
    type: Object as PropType<NetworkDetail>,
    required: true
  }
})

const video = shallowRef<NetworkDetail>();
const createRef = useCacheRecordStorage(LocalName.KEY_PLAYER_VIDEO_INDEX);
const chapterId = createRef<string>(`/${props.plugin.props.id}/${props.defaultNetwork.id}`, 'chapter', '');
const index = createRef<number>(`/${props.plugin.props.id}/${props.defaultNetwork.id}`, 'index', 0);

const title = useTitle();
const videoUrl = ref('');

const activeTab = ref('episodes');
const chapterTabId = ref(chapterId.value);

const initialize = (_p: INetworkServer, v: NetworkDetail) => {
  title.value = v.title
  // 获取详情
  video.value = v;
  // 默认值
  if (!chapterId.value) chapterId.value = video.value.chapters[0]?.id || '';
  chapterTabId.value = chapterId.value;
  switchUrl(chapterId.value, index.value);
}

const playItem = (name: string, url: string) => {
  title.value = video.value?.title + '-' + name;
  videoUrl.value = url;
}

const switchUrl = (res1: string, res2: number) => {
  if (!video.value) return;
  if (isEmptyArray(video.value.chapters)) return MessageUtil.error("播放章节为空");
  const target = res1 || video.value.chapters[0]?.name;
  const idx = res2 || 0;

  for (let chapter of video.value.chapters) {
    if (chapter.id === target) {
      if (isEmptyArray(chapter.items)) return MessageUtil.error("章节目录为空");
      const item = chapter.items[idx];
      if (!item) return MessageUtil.error("没有该章节");
      const {name, url} = item;
      // 播放音乐
      playItem(name, url);
      // 赋值
      chapterId.value = chapter.id;
      index.value = idx;
      return;
    }
  }
  // 没找到
  const first = video.value.chapters[0];
  if (!first) return MessageUtil.error("没有章节");
  if (isEmptyArray(first.items)) return MessageUtil.error("默认章节目录为空");
  const item = first.items[0];
  if (!item) return MessageUtil.error("没有默认章节");
  const {name, url} = item;
  // 播放音乐
  playItem(name, url);
  // 赋值
  chapterId.value = first.id;
  index.value = 0;
}

const handleNext = () => {
  switchUrl(chapterId.value, index.value + 1);
}

onMounted(() => {
  initialize(props.plugin, props.defaultNetwork);
});
</script>
<style scoped lang="less">
.player {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  display: flex;

  .player-side {
    position: relative;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
    width: 420px;
    z-index: 50;
    overflow-y: auto;

    .play-items {
      display: flex;
      justify-content: flex-start;
      align-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 8px;

      .play-item {
        transition: all 0.2s;
        border: 1px solid transparent;
        border-radius: var(--td-radius-default);
        background-color: var(--td-bg-color-component);
        height: 24px;
        line-height: 24px;
        text-align: center;
        cursor: pointer;
        padding: 4px 8px;

        &:hover {
          background-color: var(--td-bg-color-component-hover);
        }

        &.play {
          border-color: var(--td-border-level-2-color);
          background-color: var(--td-bg-color-component-active);
          color: var(--td-success-color);
        }

      }
    }


    .recommend {
      transition: all 0.2s;
      border: 1px solid transparent;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }
    }
  }

  .player-container {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--td-bg-color-page);
    flex: auto;

  }
}
</style>
