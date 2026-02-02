import type {MemoFriendView} from "@/entity/memo";

export interface UserSetting {
  // 头像
  avatar: string;
  // 昵称
  nickname: string;
  // 出生日期
  birthday: number;
  // 性别
  gender: 'male' | 'female' | 'neutral' | 'unknown';
  // 职业
  occupation: string;
  // 所在城市
  city: string;
  // 老家
  home: string;
  // 兴趣爱好，使用逗号分割
  hobbies: Array<string>;
  // 个人简介
  bio: string;
  // 社交关系
  relationship_status: string;
  // MBTI
  mbti: string;
}

export function buildUserSetting(): UserSetting {
  return {
    avatar: '',
    nickname: '',
    birthday: 0,
    gender: 'unknown',
    occupation: '',
    city: '',
    hobbies: [],
    bio: '',
    home: '',
    relationship_status: '',
    mbti: ''
  }
}

export function userToPrompt(user: UserSetting, friend?: MemoFriendView) {
  let name: string;
  if (friend?.preferred_name) {
    name = `我的名字叫[${user.nickname}]，你可以称呼我为[${friend.preferred_name}]`
  }else {
    name = `我的名字叫[${user.nickname}]`
  }
  return `【我的基本档案】
- 称呼：${name}。
- 社会状态：${user.relationship_status || '未知'}
- MBTI：${user.mbti || '未知'}`;
}