<template>
  <app-tool-layout title="正则表达式工具">
    <div class="regex-tool flex flex-col gap-16px">
      <t-card>
        <div class="regex-section">
          <div class="regex-input-wrapper">
            <t-input
              v-model="regexPattern"
              placeholder="请输入正则表达式"
             
              clearable
              @input="handleRegexChange"
            />
            <t-popup placement="bottom-right" trigger="click">
              <template #content>
                <div class="regex-help">
                  <h4>正则表达式语法帮助</h4>
                  <div class="help-section">
                    <h5>字符匹配</h5>
                    <ul>
                      <li><code>.</code> 匹配任意单个字符（除换行符）</li>
                      <li><code>\d</code> 匹配数字 [0-9]</li>
                      <li><code>\w</code> 匹配字母、数字、下划线 [a-zA-Z0-9_]</li>
                      <li><code>\s</code> 匹配空白字符（空格、制表符、换行符）</li>
                      <li><code>[abc]</code> 匹配方括号内任意一个字符</li>
                      <li><code>[^abc]</code> 匹配不在方括号内的任意字符</li>
                    </ul>
                  </div>
                  <div class="help-section">
                    <h5>量词</h5>
                    <ul>
                      <li><code>*</code> 匹配0次或多次</li>
                      <li><code>+</code> 匹配1次或多次</li>
                      <li><code>?</code> 匹配0次或1次</li>
                      <li><code>{n}</code> 匹配恰好n次</li>
                      <li><code>{n,m}</code> 匹配n到m次</li>
                    </ul>
                  </div>
                  <div class="help-section">
                    <h5>边界匹配</h5>
                    <ul>
                      <li><code>^</code> 匹配字符串开头</li>
                      <li><code>$</code> 匹配字符串结尾</li>
                      <li><code>\b</code> 匹配单词边界</li>
                    </ul>
                  </div>
                  <div class="help-section">
                    <h5>分组和引用</h5>
                    <ul>
                      <li><code>(abc)</code> 捕获分组</li>
                      <li><code>(?:abc)</code> 非捕获分组</li>
                      <li><code>a|b</code> 匹配a或b</li>
                      <li><code>\1</code> 引用第一个捕获组</li>
                    </ul>
                  </div>
                  <div class="help-section">
                    <h5>标志</h5>
                    <ul>
                      <li><code>i</code> 忽略大小写</li>
                      <li><code>g</code> 全局匹配</li>
                      <li><code>m</code> 多行模式</li>
                      <li><code>s</code> 点号匹配换行符</li>
                    </ul>
                  </div>
                </div>
              </template>
              <t-button variant="text" shape="square" theme="primary">
                <template #icon>
                  <help-circle-icon/>
                </template>
              </t-button>
            </t-popup>
          </div>
        </div>

        <div class="flags-section">
          <t-checkbox-group v-model="regexFlags" variant="default">
            <t-checkbox value="i">i (忽略大小写)</t-checkbox>
            <t-checkbox value="g">g (全局匹配)</t-checkbox>
            <t-checkbox value="m">m (多行模式)</t-checkbox>
            <t-checkbox value="s">s (点号匹配换行)</t-checkbox>
          </t-checkbox-group>
        </div>
      </t-card>

      <t-card title="待测试文本">
        <t-textarea
          v-model="testText"
          placeholder="请输入待测试的文本"
          :autosize="{ minRows: 6, maxRows: 12 }"
          @input="handleTextChange"
        />
      </t-card>

      <t-card title="匹配结果">
        <div v-if="highlightedText" class="highlighted-text" v-html="highlightedText"></div>
        <div v-else class="result-empty">
          <t-empty title="暂无匹配结果"/>
        </div>
      </t-card>

      <t-card>
        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-label">匹配数量:</span>
            <span class="stat-value">{{ matchCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总字符数:</span>
            <span class="stat-value">{{ totalChars }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">匹配率:</span>
            <span class="stat-value">{{ matchRate }}%</span>
          </div>
        </div>
      </t-card>
    </div>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import {HelpCircleIcon} from 'tdesign-icons-vue-next';
import AppToolLayout from "@/components/PageLayout/AppToolLayout.vue";

const regexPattern = ref('');
const regexFlags = ref<string[]>(['g']);
const testText = ref('');
const matchResults = ref<string[]>([]);
const matchPositions = ref<number[]>([]);

const matchCount = computed(() => matchResults.value.length);
const totalChars = computed(() => testText.value.length);
const matchRate = computed(() => {
  if (totalChars.value === 0) return 0;
  const matchedChars = matchResults.value.reduce((sum, match) => sum + match.length, 0);
  return ((matchedChars / totalChars.value) * 100).toFixed(2);
});

const highlightedText = computed(() => {
  if (!testText.value || matchResults.value.length === 0) return '';

  let result = '';
  let lastIndex = 0;

  const matches = matchResults.value.map((match, index) => ({
    text: match,
    start: matchPositions.value[index] ?? 0,
    end: (matchPositions.value[index] ?? 0) + match.length
  }));

  matches.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

  for (const match of matches) {
    const start = match.start ?? 0;
    if (start < lastIndex) continue;

    result += escapeHtml(testText.value.substring(lastIndex, start));
    result += `<span class="highlight">${escapeHtml(match.text)}</span>`;
    lastIndex = match.end;
  }

  result += escapeHtml(testText.value.substring(lastIndex));

  return result;
});

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const handleRegexChange = () => {
  performMatch();
};

const handleTextChange = () => {
  performMatch();
};

const performMatch = () => {
  matchResults.value = [];
  matchPositions.value = [];

  if (!regexPattern.value || !testText.value) {
    return;
  }

  try {
    const flags = regexFlags.value.join('');
    const regex = new RegExp(regexPattern.value, flags);

    if (flags.includes('g')) {
      const matches = testText.value.match(regex);
      if (matches) {
        matchResults.value = matches;
        let match;
        const tempRegex = new RegExp(regexPattern.value, flags.replace('g', ''));
        let index = 0;
        while ((match = tempRegex.exec(testText.value.substring(index))) !== null) {
          matchPositions.value.push(index + match.index);
          index += match.index + match[0].length;
        }
      }
    } else {
      const match = regex.exec(testText.value);
      if (match) {
        matchResults.value = [match[0]];
        matchPositions.value = [match.index];
      }
    }
  } catch (error) {
    console.error('正则表达式错误:', error);
  }
};
</script>

<style lang="less">
.regex-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.regex-section {
  margin-bottom: 20px;
}

.regex-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;

  .t-input {
    flex: 1;
  }
}

.flags-section {
  margin-bottom: 20px;
  padding: 12px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
}

.test-text-section,
.result-section {
  margin-bottom: 20px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin-bottom: 8px;
}

.result-content {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.highlighted-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--td-text-color-primary);

  .highlight {
    background-color: var(--td-brand-color-light);
    color: var(--td-brand-color);
    padding: 2px 4px;
    margin: 0 4px;
    border-radius: 2px;
    font-weight: 500;
  }
}

.result-empty {
  padding: 40px 20px;
  text-align: center;
}

.stats-section {
  display: flex;
  justify-content: space-between;

}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-brand-color);
}

.regex-help {
  max-width: 500px;
  max-height: 400px;
  overflow-y: auto;

  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: var(--td-text-color-primary);
  }

  .help-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: var(--td-text-color-primary);
      font-weight: 500;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      list-style: disc;

      li {
        margin-bottom: 4px;
        font-size: 13px;
        color: var(--td-text-color-secondary);

        code {
          background: var(--td-bg-color-container-hover);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          color: var(--td-brand-color);
        }
      }
    }
  }
}
</style>
