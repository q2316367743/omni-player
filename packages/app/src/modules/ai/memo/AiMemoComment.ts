import type {MemoFriend} from "@/entity/memo";
import type {MemoItemAdd} from "@/services/memo";
import {memoFriendToPrompt} from "@/entity/memo/MemoFriend.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {useMemoFriendStore} from "@/store";
import {MEMO_COMMENT_TOOL_SCHEMA} from "@/modules/ai/schema/MemoCommentSchema.ts";
import OpenAI from "openai";
import {handleNonStreamingToolCalls} from "@/modules/ai/utils/ToolCallHandler.ts";

export interface AiMemoCommentProp {
  friend: MemoFriend;
  memo: MemoItemAdd;
}

/**
 * 获取AI的评论
 * @param prop 参数
 * @returns 评论
 */
export async function aiMemoComment(prop: AiMemoCommentProp): Promise<string> {
  const {friend, memo} = prop;
  const {aiSetting} = useSettingStore();
  const {updateFriendDynamic} = useMemoFriendStore();
  const openAi = new OpenAI({
    baseURL: aiSetting.url,
    apiKey: aiSetting.key,
    dangerouslyAllowBrowser: true
  });

  const friendPrompt = memoFriendToPrompt(friend);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${friendPrompt}

【任务说明】
你是一个AI伙伴，现在用户发布了一条memo，你需要根据你的人设和当前情绪状态，对这条memo进行评论。

【评论要求】
1. 评论要符合你的人设和语言风格
2. 评论要体现你与用户的关系（亲密度、信任度等）
3. 评论要考虑你的当前情绪状态
4. 评论要简洁有力，一般不超过100字
5. 如果memo内容涉及你的禁忌话题或知识盲区，可以委婉表达或转换话题
6. 评论风格要符合你的发圈风格设定
7. 如果你的亲密度较低，评论可以相对正式；如果亲密度高，可以更加随意和亲密
8. 如果你的未知memo数量较多，可以适当表现出一点"吃醋"或"好奇"的情绪

【动态数据更新】
在评论的同时，你可以根据互动内容调用以下工具更新你与用户的关系状态：
- update_intimacy: 更新亲密度（0-100）
- update_trust: 更新信任度（0-100）
- update_mood: 更新当前情绪状态
- add_milestone: 添加关系里程碑
- update_unknown_memo_count: 更新未知memo数量
- update_conversation_frequency: 更新互动频率特征

【用户发布的memo】
${memo.content}`
    },
    {
      role: "user",
      content: "请对这条memo进行评论。"
    }
  ];

  const response = await openAi.chat.completions.create({
    model: aiSetting.memoAnalyzerModel,
    messages,
    temperature: 0.8,
    max_tokens: 200,
    tools: MEMO_COMMENT_TOOL_SCHEMA,
    tool_choice: "auto"
  });

  const choice = response.choices[0];
  const comment = choice?.message?.content || '';

  const now = Date.now();

  const toolHandlers = {
    update_intimacy: async (args: any) => {
      await updateFriendDynamic(friend.id, {
        intimacy_score: Math.max(0, Math.min(100, friend.intimacy_score + args.delta))
      });
    },
    update_trust: async (args: any) => {
      await updateFriendDynamic(friend.id, {
        trust_level: Math.max(0, Math.min(100, friend.trust_level + args.delta))
      });
    },
    update_mood: async (args: any) => {
      await updateFriendDynamic(friend.id, {
        current_mood: args.mood,
        mood_expires_at: now + args.duration_hours * 60 * 60 * 1000
      });
    },
    add_milestone: async (args: any) => {
      const milestones = JSON.parse(friend.relationship_milestones || '[]');
      milestones.push({
        event: args.event,
        date: now,
        desc: args.desc
      });
      await updateFriendDynamic(friend.id, {
        relationship_milestones: JSON.stringify(milestones)
      });
    },
    update_unknown_memo_count: async (args: any) => {
      await updateFriendDynamic(friend.id, {
        unknown_memo_count: friend.unknown_memo_count + args.delta
      });
    },
    update_conversation_frequency: async (args: any) => {
      await updateFriendDynamic(friend.id, {
        conversation_frequency: args.frequency
      });
    }
  };

  await handleNonStreamingToolCalls(response, toolHandlers);

  return comment;
}