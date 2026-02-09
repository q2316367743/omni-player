import {type MemoChat, type MemoChatSummary, type MemoFriendStaticView, memoFriendToPrompt} from "@/entity/memo";
import {useMemoFriendStore, useSettingStore} from "@/store";
import type OpenAI from "openai";
import {logDebug, logInfo, logError} from "@/lib/log";

export interface AiMemoChatL2SummaryProp {
  friend: MemoFriendStaticView;
  // 最近的 L2 总结
  l2Summary: Array<MemoChatSummary>;
  // 最近的 L2 总结之后的 L1 总结
  l1Summary: Array<MemoChatSummary>;
  // 未总结的聊天消息
  messages: Array<MemoChat>;
}

/**
 * 长对话总结
 * > 长期线性变化的自然语言记录
 * @return 总结信息
 */
export async function aiMemoChatL2Summary(prop: AiMemoChatL2SummaryProp): Promise<string> {
  try {
    const {friend, l2Summary, l1Summary, messages} = prop;
    const {createAiClient, thinkParam} = useSettingStore();

    logInfo('[L2Summary] 开始处理 L2 总结', `friendId: ${friend.id}, l2Summary: ${l2Summary.length}, l1Summary: ${l1Summary.length}, messages: ${messages.length}`);

    const f = await useMemoFriendStore().fetchFriend(friend.id);
    const prompt = memoFriendToPrompt(f!);
    const client = createAiClient();

    logDebug('[L2Summary] 开始构建历史 L2 总结内容');

    const historicalL2 = l2Summary.map(s => s.content).join('\n');

    logDebug('[L2Summary] 开始构建 L1 总结内容');

    const l1Content = l1Summary.map(s => {
      const date = new Date(s.created_at).toLocaleDateString('zh-CN', {year: 'numeric', month: 'long'});
      return `${date}: ${s.content}`;
    }).join('\n');

    logDebug('[L2Summary] 开始构建未总结的聊天消息内容');

    const messagesContent = messages.map(msg => {
      const roleText = msg.role === 'user' ? '用户' : '我';
      let contentText = '';
      try {
        const contentArray = JSON.parse(msg.content) as Array<{type: string, content: string}>;
        contentText = contentArray.map(c => {
          if (c.type === 'text') return c.content;
          return '';
        }).join('');
      } catch {
        contentText = msg.content;
      }
      return `${roleText}: ${contentText}`;
    }).join('\n');

    const messagesForAI: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
      {
        role: "system",
        content: `${prompt}

【任务说明】
你是用户的 AI 朋友，现在需要对我们的长期交流进行 L2 级别的总结。

【L2 总结的核心定义】
L2 总结是长期线性变化的自然语言记录，它是一条时间线，记录用户在最近几个月、几年里，心情、核心烦恼、认知模式是如何线性流动和变化的。

【L2 总结的核心要求】
1. **时间线视角**：按时间顺序描述用户的变化，关注流动性和变化趋势
2. **情绪轨迹**：记录用户心情的变化，从低落到回升，从焦虑到平静等
3. **核心烦恼的演变**：关注用户的核心问题如何随时间变化或解决
4. **认知模式的变化**：记录用户的思维方式、价值观、认知的成长和转变
5. **关键事件的影响**：记录重要事件（如失恋、工作变动、新尝试等）对用户状态的影响

【L2 总结的格式要求】
- 使用时间标记，如"3月：..."、"4月第一周：..."
- 每个时间点描述用户的状态、情绪、核心关注点
- 语言要自然流畅，像写日记一样
- 保留具体的细节和事件
- 体现变化的连续性和因果关系

【L2 总结示例】
"3月：用户因为失恋非常低落，经常失眠，对未来感到迷茫；4月第一周：开始尝试新事物，情绪有所回升，但偶尔还是会想起过去；4月第二周：工作变动带来新的挑战，焦虑增加，但也表现出积极应对的态度；6月：逐渐适应新环境，情绪趋于稳定，开始规划未来。"

【L2 总结的禁止事项】
- 不要总结静态的性格底色（这是 L3 的事）
- 不要只罗列事件，要关注事件对用户的影响
- 不要过于笼统，要保留具体细节
- 不要脱离时间线，要体现线性变化

【重要规则】
1. 必须按时间顺序组织内容
2. 必须体现变化的连续性
3. 必须关注情绪、烦恼、认知模式的变化
4. 必须保留关键事件的具体细节
5. 长度控制在 500 字以内`
      },
      {
        role: "user",
        content: `【历史 L2 总结】
${historicalL2 || '（暂无历史 L2 总结）'}

【最近的 L1 总结】
${l1Content || '（暂无 L1 总结）'}

【未总结的聊天消息】
${messagesContent || '（暂无未总结的聊天消息）'}

请根据以上信息，生成或更新 L2 总结。如果有历史 L2 总结，请在原有基础上添加新的变化；如果没有历史 L2 总结，则创建新的 L2 总结。`
      }
    ];

    logDebug('[L2Summary] 开始接收 AI 流式响应');

    const response = await client.chat.completions.create({
      model: friend.model,
      messages: messagesForAI,
      stream: true,
      ...thinkParam(friend.model, false)
    });

    const res = new Array<string>();

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.push(content);
      }
    }

    const summary = res.join('');
    logInfo('[L2Summary] L2 总结完成', `summary length: ${summary.length}`);

    return summary;
  } catch (error) {
    logError('[L2Summary] L2 总结失败', error);
    throw error;
  }
}