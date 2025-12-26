<template>
  <div class="home-container">
    <div class="home-content">
      <div class="welcome-section">
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎使用亦无悔</h1>
          <p class="welcome-subtitle">一站式多媒体管理平台</p>
        </div>
        <div class="welcome-stats">
          <div class="stat-item">
            <div class="stat-value">{{ mediaCount }}</div>
            <div class="stat-label">媒体库</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ networkCount }}</div>
            <div class="stat-label">网络资源</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ subscribeCount }}</div>
            <div class="stat-label">订阅源</div>
          </div>
        </div>
      </div>

      <div class="quick-access">
        <div class="section-title">
          <span>快速访问</span>
        </div>
        <div class="quick-cards">
          <div v-for="card in quickCards" :key="card.id" class="quick-card" @click="handleCardClick(card)">
            <div class="card-icon" :style="{ background: card.bgColor }">
              <component :is="card.icon" />
            </div>
            <div class="card-info">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-desc">{{ card.desc }}</div>
            </div>
            <chevron-right-icon class="card-arrow"/>
          </div>
        </div>
      </div>

      <div class="recent-section">
        <div class="section-header">
          <div class="section-title">最近访问</div>
          <t-button size="small" variant="text" theme="primary" @click="goHome">清空</t-button>
        </div>
        <div v-if="recentItems.length > 0" class="recent-list">
          <div v-for="item in recentItems" :key="item.id" class="recent-item" @click="handleRecentClick(item)">
            <div class="recent-icon">
              <component :is="item.icon" />
            </div>
            <div class="recent-info">
              <div class="recent-name">{{ item.name }}</div>
              <div class="recent-time">{{ item.time }}</div>
            </div>
            <play-icon class="recent-play" size="20"/>
          </div>
        </div>
        <t-empty v-else description="暂无最近访问记录"/>
      </div>

      <div class="tips-section">
        <div class="tips-card">
          <bulb-icon class="tips-icon" size="24"/>
          <div class="tips-content">
            <div class="tips-title">使用提示</div>
            <div class="tips-text">点击左侧导航栏的 + 号可以添加媒体库、网络资源和订阅源</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ChevronRightIcon,
  PlayIcon,
  VideoIcon,
  InternetIcon,
  LogoGithubIcon,
  FileIcon,
} from 'tdesign-icons-vue-next';
import {useMediaServerStore, useNetworkServerStore} from "@/store";
import {useRequest} from "@/hooks/UseRequest.ts";
import {listSubscribe} from "@/services";

const router = useRouter();

const mediaCount = computed(() => useMediaServerStore().servers.length);
const networkCount = computed(() => useNetworkServerStore().servers.length);
const {data: subscriptions} = useRequest(listSubscribe, {defaultValue: []});
const subscribeCount = computed(() => subscriptions.value.length);

const quickCards = [
  {
    id: 'media',
    title: '媒体库',
    desc: '管理本地媒体资源',
    icon: VideoIcon,
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    action: () => {
      if (mediaCount.value > 0) {
        router.push(`/media/${useMediaServerStore().servers[0]?.id}/home`);
      }
    }
  },
  {
    id: 'network',
    title: '网络资源',
    desc: '浏览在线视频内容',
    icon: InternetIcon,
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    action: () => {
      if (networkCount.value > 0) {
        router.push(`/network/${useNetworkServerStore().servers[0]?.id}/home`);
      }
    }
  },
  {
    id: 'subscribe',
    title: '订阅源',
    desc: '订阅RSS和播客',
    icon: LogoGithubIcon,
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    action: () => {
      if (subscribeCount.value > 0) {
        router.push(`/subscribe/${subscriptions.value[0]?.id}/0`);
      }
    }
  },
  {
    id: 'notes',
    title: '笔记',
    desc: '记录观看心得',
    icon: FileIcon,
    bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    action: () => {
    }
  }
];

const recentItems = ref([
  {
    id: '1',
    name: '最近播放的视频',
    time: '2小时前',
    icon: VideoIcon,
    path: ''
  }
]);

const handleCardClick = (card: any) => {
  card.action();
};

const handleRecentClick = (item: any) => {
  if (item.path) {
    router.push(item.path);
  }
};

const goHome = () => {
  recentItems.value = [];
};
</script>

<style scoped lang="less">
.home-container {
  width: calc(100% - 48px);
  height: calc(100% - 48px);
  overflow-y: auto;
  padding: 24px;
  background: var(--td-bg-color-container);
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);

  .welcome-text {
    .welcome-title {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .welcome-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .welcome-stats {
    display: flex;
    gap: 32px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 36px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.85;
      }
    }
  }
}

.quick-access {
  margin-bottom: 24px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--td-text-color-primary);
  }

  .quick-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;

    .quick-card {
      background: var(--td-bg-color-container-hover);
      border: 1px solid var(--td-border-level-1-color);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        border-color: var(--td-brand-color);
      }

      .card-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .card-info {
        flex: 1;

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--td-text-color-primary);
          margin-bottom: 4px;
        }

        .card-desc {
          font-size: 13px;
          color: var(--td-text-color-secondary);
        }
      }

      .card-arrow {
        color: var(--td-text-color-placeholder);
        flex-shrink: 0;
      }
    }
  }
}

.recent-section {
  margin-bottom: 24px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--td-text-color-primary);
    }
  }

  .recent-list {
    background: var(--td-bg-color-container-hover);
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 12px;
    overflow: hidden;

    .recent-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--td-bg-color-component-hover);
      }

      &:not(:last-child) {
        border-bottom: 1px solid var(--td-border-level-1-color);
      }

      .recent-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .recent-info {
        flex: 1;

        .recent-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--td-text-color-primary);
          margin-bottom: 2px;
        }

        .recent-time {
          font-size: 13px;
          color: var(--td-text-color-secondary);
        }
      }

      .recent-play {
        color: var(--td-brand-color);
        flex-shrink: 0;
      }
    }
  }
}

.tips-section {
  .tips-card {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .tips-icon {
      color: #e67e22;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .tips-content {
      flex: 1;

      .tips-title {
        font-size: 16px;
        font-weight: 600;
        color: #d35400;
        margin-bottom: 6px;
      }

      .tips-text {
        font-size: 14px;
        color: #e67e22;
        line-height: 1.5;
      }
    }
  }
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;

    .welcome-stats {
      margin-top: 24px;
      gap: 24px;
    }
  }

  .quick-cards {
    grid-template-columns: 1fr;
  }
}
</style>
