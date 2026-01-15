<template>
  <div class="chat-list" ref="chatContentRef">
    <div v-for="(item, index) in messages" :key="item.id" class="chat-item" :class="[item.role]">
      <div v-if="item.role === 'system'" class="system-message">
        <div class="system-content">{{ item.content }}</div>
      </div>
      <div v-else-if="item.role === 'summary'" class="summary-message">
        <div class="summary-header">
          <file-icon class="summary-icon"/>
          <span class="summary-title">会议总结</span>
        </div>
        <div class="summary-content">
          <markdown-preview :content="item.content"/>
        </div>
      </div>
      <div v-else-if="item.role === 'assistant'" class="assistant-message">
        <div class="message-avatar assistant-avatar">
          <internet-icon/>
        </div>
        <div class="message-body">
          <div class="participant-name">{{ getParticipantName(item.participant_id) }}</div>
          <div v-if="item.thinking && item.thinking.length > 0" class="thinking-section">
            <div class="thinking-header">
              <check-circle-icon v-if="!isStreamLoad || index !== messages.length - 1" class="thinking-icon"/>
              <div v-else class="thinking-loading">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
              <span class="thinking-text">{{
                  isStreamLoad && index === messages.length - 1 ? '思考中...' : '已深度思考'
                }}</span>
            </div>
            <div class="thinking-content">{{ item.thinking }}</div>
          </div>
          <div v-if="item.content" class="message-content">
            <markdown-preview :content="item.content"/>
          </div>
        </div>
      </div>
      <div v-else-if="item.role === 'user'" class="user-message">
        <div class="message-body">
          <div class="message-content">
            <markdown-preview :content="item.content"/>
          </div>
        </div>
        <div class="message-avatar user-avatar">
          <user-icon/>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {AiRtMessage, AiRtParticipant} from "@/entity/app/ai/roundtable";
import {CheckCircleIcon, FileIcon, InternetIcon, UserIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  messages: {
    type: Array as PropType<Array<AiRtMessage>>,
    default: () => ([])
  },
  isStreamLoad: {
    type: Boolean,
    default: false
  },
  participantMap: {
    type: Map as PropType<Map<string, AiRtParticipant>>,
    default: () => new Map()
  }
});

const chatContentRef = ref();

const getParticipantName = (participantId: string) => {
  const participant = props.participantMap.get(participantId);
  return participant ? participant.name : '未知';
};

defineExpose({
  scrollTo: (obj: any) => {
    chatContentRef.value.scrollTo(obj);
  },
  scrollHeight: () => chatContentRef.value?.scrollHeight
})
</script>
<style scoped lang="less">
.chat-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;

  .chat-item {
    max-width: 900px;
    margin: 0 auto 24px;
    transition: all var(--fluent-transition-normal);

    &.system {
      .system-message {
        padding: 12px 16px;
        background: transparent;
        border: 1px solid var(--td-text-color-disabled);
        border-radius: var(--fluent-radius-card);
        color: var(--td-text-color-disabled);
        font-size: 13px;
        line-height: 1.5;
        max-width: 800px;
        margin: 0 auto;

        .system-content {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }

    &.summary {
      .summary-message {
        max-width: 900px;
        margin: 0 auto;
        background: linear-gradient(135deg, rgba(82, 196, 26, 0.05) 0%, rgba(82, 196, 26, 0.02) 100%);
        border: 1px solid rgba(82, 196, 26, 0.2);
        border-radius: var(--fluent-radius-card);
        padding: 20px 24px;
        box-shadow: var(--fluent-elevation-1);
        transition: all var(--fluent-transition-normal);

        &:hover {
          box-shadow: var(--fluent-elevation-2);
          border-color: rgba(82, 196, 26, 0.3);
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(82, 196, 26, 0.15);

          .summary-icon {
            width: 20px;
            height: 20px;
            color: var(--td-success-color-5);
          }

          .summary-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--td-success-color-6);
            letter-spacing: 0.5px;
          }
        }

        .summary-content {
          font-size: 15px;
          line-height: 1.7;
          color: var(--td-text-color-primary);

          :deep(.markdown-preview) {
            p {
              margin-bottom: 12px;

              &:last-child {
                margin-bottom: 0;
              }
            }

            ul, ol {
              padding-left: 20px;
              margin-bottom: 12px;

              li {
                margin-bottom: 8px;
              }
            }

            strong {
              color: var(--td-success-color-7);
              font-weight: 600;
            }

            h1, h2, h3 {
              color: var(--td-success-color-7);
              margin: 16px 0 8px;
              font-weight: 600;

              &:first-child {
                margin-top: 0;
              }
            }
          }
        }
      }
    }

    &.assistant {
      .assistant-message {
        display: flex;
        gap: 12px;
        max-width: 800px;
        margin: 0 auto;

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--fluent-gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: white;
          box-shadow: var(--fluent-elevation-2);

          svg {
            width: 24px;
            height: 24px;
          }
        }

        .message-body {
          flex: 1;
          min-width: 0;

          .participant-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--td-text-color-secondary);
            margin-bottom: 8px;
          }

          .thinking-section {
            margin-bottom: 12px;
            background: var(--fluent-card-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--fluent-card-border);
            border-radius: var(--fluent-radius-card);
            box-shadow: var(--fluent-elevation-1);
            overflow: hidden;
            transition: all var(--fluent-transition-normal);

            &:hover {
              box-shadow: var(--fluent-elevation-2);
            }

            .thinking-header {
              padding: 12px 16px;
              background: var(--fluent-item-hover);
              border-bottom: 1px solid var(--fluent-border-subtle);
              display: flex;
              align-items: center;
              gap: 8px;
              font-weight: 500;

              .thinking-icon {
                color: var(--td-success-color-5);
                font-size: 20px;
              }

              .thinking-loading {
                display: flex;
                gap: 4px;

                .dot {
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background: var(--fluent-accent-color);
                  animation: bounce 1.4s infinite ease-in-out both;

                  &:nth-child(1) {
                    animation-delay: -0.32s;
                  }

                  &:nth-child(2) {
                    animation-delay: -0.16s;
                  }
                }
              }

              @keyframes bounce {
                0%, 80%, 100% {
                  transform: scale(0);
                }
                40% {
                  transform: scale(1);
                }
              }

              .thinking-text {
                font-size: 14px;
              }
            }

            .thinking-content {
              padding: 16px;
              font-size: 14px;
              line-height: 1.6;
              color: var(--td-text-color-secondary);
            }
          }

          .message-content {
            background: var(--td-bg-color-container);
            border: 1px solid var(--fluent-card-border);
            border-radius: var(--fluent-radius-card);
            font-size: 15px;
            line-height: 1.7;
            color: var(--td-text-color-primary);
            word-wrap: break-word;
            white-space: pre-wrap;
          }
        }
      }
    }

    &.user {
      margin-left: auto;

      .user-message {
        display: flex;
        gap: 12px;
        max-width: 800px;
        margin: 0 auto;
        flex-direction: row;

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--fluent-gradient-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: white;
          box-shadow: var(--fluent-elevation-2);

          svg {
            width: 24px;
            height: 24px;
          }
        }

        .message-body {
          flex: 1;
          min-width: 0;

          .message-content {
            background: var(--td-bg-color-secondarycontainer);
            backdrop-filter: blur(10px);
            border: 1px solid var(--fluent-card-border);
            border-radius: var(--fluent-radius-card);
            box-shadow: var(--fluent-card-shadow);
            font-size: 15px;
            line-height: 1.7;
            color: var(--td-text-color-primary);
            word-wrap: break-word;
            white-space: pre-wrap;
            transition: all var(--fluent-transition-normal);

            &:hover {
              box-shadow: var(--fluent-card-shadow-hover);
            }
          }
        }
      }
    }
  }
}
</style>
