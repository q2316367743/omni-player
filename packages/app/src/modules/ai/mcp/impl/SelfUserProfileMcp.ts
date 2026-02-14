import type {AiMcpWrapper} from "@/modules/ai/mcp";
import OpenAI from "openai";
import {useSettingStore} from "@/store";
import {formatDate} from "@/util/lang/DateUtil.ts";

export class SelfUserProfileMcp implements AiMcpWrapper {

  check(functionName: string): boolean {
    return functionName === 'self_get_user_profile';
  }

  async execute(functionName: string, args: any): Promise<any> {
    if (functionName !== 'self_get_user_profile') {
      return Promise.reject(new Error(`无效的函数名：${functionName}`));
    }

    const {userSetting} = useSettingStore();
    const result = {
      nickname: userSetting.nickname,
      avatar: userSetting.avatar,
      birthday: formatDate(userSetting.birthday, 'YYYY-MM-DD HH:mm'),
      gender: userSetting.gender,
      occupation: userSetting.occupation,
      city: userSetting.city,
      home: userSetting.home,
      hobbies: userSetting.hobbies,
      bio: userSetting.bio,
      relationship_status: userSetting.relationship_status,
      mbti: userSetting.mbti
    };

    return {functionName, args, result};
  }

  getSchema(): Array<OpenAI.Chat.Completions.ChatCompletionTool> {
    return [
      {
        type: "function",
        function: {
          name: "self_get_user_profile",
          description: "获取用户的个人档案信息，包括昵称、生日、性别、职业、城市、兴趣爱好、MBTI等。",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      }
    ];
  }
}
