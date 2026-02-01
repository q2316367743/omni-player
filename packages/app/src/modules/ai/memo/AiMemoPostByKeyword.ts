import type {MemoItemAdd} from "@/services/memo";
import type {MemoFriendView} from "@/entity/memo";
import {memoFriendToPrompt, getPostingStyleDescription, getPostingStyleText} from "@/entity/memo/MemoFriend.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import OpenAI from "openai";
import {logDebug, logError} from "@/lib/log.ts";

interface AiMemoPostByKeywordProp {
  memo: MemoItemAdd;
  friend: MemoFriendView;
}

export async function aiMemoPostByKeyword(prop: AiMemoPostByKeywordProp): Promise<string> {
  const {friend, memo} = prop;

  logDebug(`[AiMemoPostByKeyword] 开始为朋友 ${friend.name} 生成朋友圈内容`);

  const openAi = useSettingStore().createAiClient();

  const friendPrompt = memoFriendToPrompt(friend);
  const {posting_style} = friend;

  const styleDesc = getPostingStyleDescription(posting_style);

  const systemPrompt = `${friendPrompt}

【任务说明】
你现在要基于用户分享的一条 memo 内容，以你的身份和性格，用${getPostingStyleText(posting_style)}（${styleDesc}）的风格，生成一条朋友圈内容。

【朋友圈要求】
1. 内容要符合你的人设和性格特点
2. 语言风格要与你的 speaking_style 保持一致
3. 内容要简短精炼，适合朋友圈的长度（50-240字）
4. 可以适当使用表情符号来增强表达
5. 不要直接复制用户的 memo 内容，而是用自己的话重新表达
6. 要体现出你对用户的关注和情感连接
7. 如果是鼓励型，要给予温暖和支持
8. 如果是调侃型，要幽默但不伤人
9. 如果是观察型，要有独到的见解
10. 如果是诗意型，要富有美感
11. 如果是讽刺型，要犀利但不刻薄

【输出格式】
直接输出朋友圈内容，不要添加任何前缀或后缀说明。`;

  const userPrompt = `用户分享的 memo 内容：
${memo.content}

请基于以上内容，生成一条朋友圈：`;

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

    logDebug(`[AiMemoPostByKeyword] 朋友 ${friend.name} 朋友圈内容生成完成`);

    return res.join('');
  } catch (error) {
    logError(`[AiMemoPostByKeyword] 朋友 ${friend.name} 朋友圈内容生成失败`, error);
    return '';
  }
}