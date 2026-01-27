<template>
  <div class="memo-page">
    <div class="notebook" :class="{ 'history-open': showHistory }">
      <div class="notebook-spine" @click="toggleHistory">
        <div class="spine-rings">
          <div v-for="i in 6" :key="i" class="ring"></div>
        </div>
        <div class="spine-label">
          <span v-if="!showHistory">历史记录</span>
          <span v-else>关闭</span>
        </div>
      </div>

      <div class="notebook-content">
        <div class="notebook-page current-page">
          <div class="page-lines">
            <textarea
              v-model="currentMemo"
              class="memo-textarea"
              placeholder="在这里写下你的碎念..."
              @input="handleMemoChange"
            ></textarea>
          </div>
          <div class="page-number">当前页</div>
        </div>
      </div>

      <div class="notebook-history" v-if="showHistory">
        <div class="history-header">
          <h3>历史碎念</h3>
          <div class="close-btn" @click="toggleHistory">
            <t-icon name="close" size="20px" />
          </div>
        </div>
        <div class="history-list">
          <div
            v-for="(memo, index) in historyMemos"
            :key="index"
            class="history-item"
            @click="loadMemo(memo)"
          >
            <div class="history-date">{{ memo.date }}</div>
            <div class="history-content">{{ memo.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Memo {
  date: string;
  content: string;
}

const currentMemo = ref('');
const showHistory = ref(false);

const historyMemos: Memo[] = [
  {
    date: '2024-01-15',
    content: '今天天气真好，阳光明媚，心情也跟着好起来了。',
  },
  {
    date: '2024-01-14',
    content: '读了一本好书，收获满满，推荐给大家。',
  },
  {
    date: '2024-01-13',
    content: '和朋友一起喝茶聊天，度过了愉快的下午。',
  },
  {
    date: '2024-01-12',
    content: '完成了这个项目，感觉很有成就感。',
  },
  {
    date: '2024-01-11',
    content: '学习了一些新技能，感觉自己在不断进步。',
  },
];

const toggleHistory = () => {
  showHistory.value = !showHistory.value;
};

const handleMemoChange = () => {
  console.log('Memo changed:', currentMemo.value);
};

const loadMemo = (memo: Memo) => {
  currentMemo.value = memo.content;
  showHistory.value = false;
};
</script>

<style scoped lang="less">
.memo-page {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 66px 20px 20px 120px;
}

.notebook {
  position: relative;
  width: 800px;
  height: 640px;
  display: flex;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  &.history-open {
    .notebook-content {
      transform: rotateY(-15deg);
      box-shadow: -10px 10px 30px rgba(0, 0, 0, 0.2);
    }

    .notebook-history {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.notebook-spine {
  position: absolute;
  left: -40px;
  top: 0;
  width: 50px;
  height: 100%;
  background: linear-gradient(90deg, #8b7355 0%, #a0896c 50%, #8b7355 100%);
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;

  &:hover {
    background: linear-gradient(90deg, #9a8264 0%, #b09a7d 50%, #9a8264 100%);
  }

  .spine-rings {
    display: flex;
    flex-direction: column;
    gap: 70px;

    .ring {
      width: 20px;
      height: 20px;
      border: 3px solid #6b5344;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #d4c4b0, #a0896c);
      box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3),
                  0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  .spine-label {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: #f5f5dc;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 2px;
    margin-top: auto;
    margin-bottom: 20px;
  }
}

.notebook-content {
  flex: 1;
  background: linear-gradient(to bottom, #fffef9, #f9f6f0);
  border-radius: 0 8px 8px 0;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 30px;
    height: 100%;
    background: linear-gradient(90deg, rgba(139, 115, 85, 0.1), transparent);
  }
}

.notebook-page {
  width: 100%;
  height: 100%;
  padding: 40px 60px 40px 80px;
  position: relative;

  &.current-page {
    .page-lines {
      background-image: repeating-linear-gradient(
        transparent,
        transparent 31px,
        #e8e4d9 31px,
        #e8e4d9 32px
      );
    }
  }
}

.page-lines {
  width: 100%;
  height: calc(100% - 40px);
  position: relative;
}

.memo-textarea {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  resize: none;
  font-family: 'LXGW WenKai', 'KaiTi', '楷体', serif;
  font-size: 18px;
  line-height: 32px;
  color: #4a4a4a;
  outline: none;
  padding: 0;
  margin: 0;

  &::placeholder {
    color: #b8b4ae;
    font-style: italic;
  }

  &:focus {
    &::placeholder {
      color: transparent;
    }
  }
}

.page-number {
  position: absolute;
  bottom: 10px;
  right: 20px;
  font-size: 12px;
  color: #8b7355;
  font-style: italic;
}

.notebook-history {
  position: absolute;
  left: -300px;
  top: 0;
  width: 280px;
  height: 100%;
  background: linear-gradient(135deg, #fffef9, #f5f0e6);
  border-radius: 8px 0 0 8px;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  z-index: 10;

  .history-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e8e4d9;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #6b5344;
      font-family: 'LXGW WenKai', 'KaiTi', '楷体', serif;
    }

    .close-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(139, 115, 85, 0.1);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #8b7355;

      &:hover {
        background: rgba(139, 115, 85, 0.2);
        transform: rotate(90deg);
      }
    }
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    padding: 12px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(139, 115, 85, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: translateX(5px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .history-date {
      font-size: 12px;
      color: #8b7355;
      margin-bottom: 6px;
      font-style: italic;
    }

    .history-content {
      font-size: 14px;
      color: #4a4a4a;
      font-family: 'LXGW WenKai', 'KaiTi', '楷体', serif;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}
</style>
