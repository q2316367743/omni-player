import {type MemoChatView, type MemoFriendStaticView} from "@/entity/memo";
import {useSettingStore} from "@/store";
import type OpenAI from "openai";
import {logDebug, logInfo, logError} from "@/lib/log";

export interface AiMemoChatL1SummaryProp {
  messages: Array<MemoChatView>;
  friend: MemoFriendStaticView;
}

export async function aiMemoChatL1Summary(prop: AiMemoChatL1SummaryProp): Promise<string> {
  try {
    const {friend, messages} = prop;
    const {createAiClient, thinkParam} = useSettingStore();

    logInfo('[L1Summary] 开始处理 L1 总结', `friendId: ${friend.id}, messages: ${messages.length}`);

    const client = createAiClient();

    const chatContent = messages.map(msg => {
      const roleText = msg.role === 'user' ? '用户' : '我';
      const contentText = msg.content.map(c => {
        if (c.type === 'text') return c.content;
        return '';
      }).join('');
      return `${roleText}: ${contentText}`;
    }).join('\n');

    logDebug('[L1Summary] 聊天内容已构建', `content length: ${chatContent.length}`);

    const messagesForAI: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
      {
        role: "system",
        content: `${prompt}

【任务说明】
你是【智能索引器】。请将聊天记录压缩为一条便于 AI 识别模式的索引串。

【格式要求：三段式】
请按以下顺序，用逗号连接：
1. **关系/情感**：简短的定语（如：寒暄/亲密/怀念/焦虑）。
2. **核心事实**：聊了什么事，做了什么决定（用短句）。
3. **行动/建议**：具体的建议或待办。

【筛选规则】
- 保留具体动作（如"递纸巾"），去掉环境背景（如"教学楼"、"2023年"）。
- 保留核心建议（如"加主食"），去掉过程描述（如"我说了..."）。
- 总长度控制在 50 字左右。

【示例】
- 输入：聊了2023年在教学楼递纸巾带报到的事，用户点了芋圆，我建议加热主食。
- 输出：怀念过去，提及递纸巾往事。用户点芋圆外卖，建议加主食防胃疼。`
      },
      {
        role: "user",
        content: `请按上述逻辑，将以下聊天记录压缩为一句话索引：
${chatContent}`

      }
    ];

    const response = await client.chat.completions.create({
      model: friend.model,
      messages: messagesForAI,
      stream: true,
      ...thinkParam(friend.model, false)
    });

    logDebug('[L1Summary] 开始接收 AI 流式响应');

    const res = new Array<string>();

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.push(content);
      }
    }

    const summary = res.join('');
    logInfo('[L1Summary] L1 总结完成', `summary length: ${summary.length}`);

    return summary;
  } catch (error) {
    logError('[L1Summary] L1 总结失败', error);
    throw error;
  }
}