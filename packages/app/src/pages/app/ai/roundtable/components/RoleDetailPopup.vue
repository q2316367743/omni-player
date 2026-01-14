<template>
  <div class="role-detail-popup">
    <div class="detail-header">
      <h4 class="detail-name">{{ role.name }}</h4>
      <t-tag size="small" theme="default">普通角色</t-tag>
    </div>
    <div class="detail-section">
      <div class="detail-label">提示词</div>
      <div class="detail-content">{{ role.prompt || '暂无提示词' }}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">使用的模型</div>
      <div class="detail-content">{{ role.model }}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">响应字数限制</div>
      <div class="detail-content">
        {{ role.min_response_length === -1 && role.max_response_length === -1
        ? '无限制'
        : `${role.min_response_length} - ${role.max_response_length === -1 ? '无限制' : role.max_response_length}` }}
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-label">生成随机性</div>
      <div class="detail-content">{{ role.temperature }}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">最大思考时间</div>
      <div class="detail-content">{{ role.timeout_per_turn }} 秒</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">功能设置</div>
      <div class="detail-content">
        <div class="setting-item">
          <span class="setting-label">事实核查：</span>
          <span :class="role.enable_fact_checking ? 'setting-value enabled' : 'setting-value disabled'">
                        {{ role.enable_fact_checking ? '启用' : '禁用' }}
                      </span>
        </div>
        <div class="setting-item">
          <span class="setting-label">允许主动@他人：</span>
          <span :class="role.allow_cross_talk ? 'setting-value enabled' : 'setting-value disabled'">
                        {{ role.allow_cross_talk ? '启用' : '禁用' }}
                      </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {AiRtRole} from "@/entity/app/ai/roundtable";

defineProps({
  role: {
    type: Object as PropType<AiRtRole>,
    required: true
  }
});
</script>
<style scoped lang="less">
.role-detail-popup {
  padding: 16px;
  min-width: 320px;
  max-width: 400px;

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--fluent-border-subtle);
  }

  .detail-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  .detail-section {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .detail-label {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin-bottom: 4px;
    font-weight: 500;
  }

  .detail-content {
    font-size: 13px;
    color: var(--td-text-color-primary);
    line-height: 1.5;
    word-break: break-all;
  }

  .setting-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .setting-label {
    font-size: 13px;
    color: var(--td-text-color-secondary);
    margin-right: 8px;
  }

  .setting-value {
    font-size: 13px;
    font-weight: 500;

    &.enabled {
      color: var(--td-success-color);
    }

    &.disabled {
      color: var(--td-text-color-placeholder);
    }
  }
}
</style>
