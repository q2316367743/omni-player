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
    home: ''
  }
}