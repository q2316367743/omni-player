<template>
  <div class="home-container">
    <div class="home-header">
      <div class="home-title">
        <div class="home-logo">
          <div class="w-24px" v-if="collapsed">
            <t-button theme="primary" size="small" variant="text" shape="square"
                      @click="toggleCollapsed()">
              <template #icon>
                <menu-icon/>
              </template>
            </t-button>
          </div>

        </div>
      </div>
    </div>
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

      <div class="tips-section">
        <div class="tips-card">
          <help-icon class="tips-icon" size="24"/>
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
import {HelpIcon, MenuIcon} from 'tdesign-icons-vue-next';
import {useMediaServerStore, useNetworkServerStore} from "@/store";
import {useRequest} from "@/hooks/UseRequest.ts";
import {listSubscribe} from "@/services";
import {collapsed, toggleCollapsed} from "@/global/Constants.ts";


const mediaCount = computed(() => useMediaServerStore().servers.length);
const networkCount = computed(() => useNetworkServerStore().servers.length);
const {data: subscriptions} = useRequest(listSubscribe, {defaultValue: []});
const subscribeCount = computed(() => subscriptions.value.length);


</script>

<style scoped lang="less">
.home-container {
  width: calc(100% - 32px);
  height: calc(100% - 32px);
  overflow-y: auto;
  padding: 16px;
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
