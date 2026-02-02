import type {MemoFriendView, MemoPost} from "@/entity/memo";
import {memoFriendToPrompt, getPostingStyleDescription, getPostingStyleText} from "@/entity/memo/MemoFriend.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import OpenAI from "openai";
import {logDebug, logError} from "@/lib/log.ts";

interface AiMemoPostCommentProp {
  friend: MemoFriendView;
  post: MemoPost;
  // 触发评论的关键字
  keyword: string;
}

/**
 * 基于朋友圈，根据关键字触发了评论
 */
export async function aiMemoPostComment(prop: AiMemoPostCommentProp): Promise<string> {
  const {friend, post, keyword} = prop;

  logDebug(`[AiMemoPostComment] 开始为朋友 ${friend.name} 生成评论，触发关键字：${keyword}`);

  const openAi = useSettingStore().createAiClient();

  const friendPrompt = memoFriendToPrompt(friend);
  const {posting_style} = friend;

  const styleDesc = getPostingStyleDescription(posting_style);

  const systemPrompt = `${friendPrompt}

【任务说明】
你现在要基于一条朋友圈内容，以你的身份和性格，用${getPostingStyleText(posting_style)}（${styleDesc}）的风格，生成一条评论。

【触发关键字】
"${keyword}"

【评论要求】
1. 内容要符合你的人设和性格特点
2. 语言风格要与你的 speaking_style 保持一致
3. 评论要简短精炼，适合评论的长度（20-100字）
4. 可以适当使用表情符号来增强表达
5. 评论要围绕触发关键字 "${keyword}" 展开
6. 要体现出你对朋友圈内容的理解和情感连接
7. 如果是鼓励型，要给予温暖和支持
8. 如果是调侃型，要幽默但不伤人
9. 如果是观察型，要有独到的见解
10. 如果是诗意型，要富有美感
11. 如果是讽刺型，要犀利但不刻薄
12. 评论要自然，不要生硬地插入关键字

【输出格式】
直接输出评论内容，不要添加任何前缀或后缀说明。`;

  const userPrompt = `朋友圈内容：
${post.content}

触发关键字：${keyword}

请基于以上内容，生成一条评论：`;

  const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [
    {role: 'system', content: systemPrompt},
    {role: 'user', content: userPrompt}
  ];

  try {
    const response = await openAi.chat.completions.create({
      model: friend.model,
      messages,
      stream: true,
      ...({thinking: {type: 'disabled'}})
    });

    const res = new Array<string>();

    for await (const chunk of response) {
      for (const choice of chunk.choices) {
        const content = choice.delta.content;
        if (content) {
          res.push(content)
        }
      }

    }

    logDebug(`[AiMemoPostComment] 朋友 ${friend.name} 评论生成完成`);

    return res.join('');
  } catch (error) {
    logError(`[AiMemoPostComment] 朋友 ${friend.name} 评论生成失败`, error);
    return '';
  }
}