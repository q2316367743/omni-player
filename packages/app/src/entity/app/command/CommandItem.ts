export interface CommandItemArgValue {
  id: string;
  type: 'value';
  // 标记
  flag: string;
  // 描述
  description: string;
}

export interface CommandItemArgFlag {
  id: string;
  type: 'flag';
  // 标记
  flag: string;
  // 短标记
  short: string;
  // 描述
  description: string;
}

export interface CommandItemArgSub {
  id: string;
  type: 'sub';
  // 标记
  flag: string;
  // 描述
  description: string;
  // 子参数
  args: Array<CommandItemArg>;
}

export type CommandItemArg = CommandItemArgFlag | CommandItemArgValue | CommandItemArgSub

/**
 * 命令项
 */
export interface CommandItem {
  id: string;
  created_at: number;
  updated_at: number;

  name: string;

  args: Array<CommandItemArg>
}

export function build(): CommandItem {
  return {
    id: '',
    created_at: 0,
    updated_at: 0,
    name: 'docker',
    args: [{
      id: '1',
      type: 'sub',
      flag: 'run',
      description: '运行容器',
      args: [{
        id: '1',
        type: 'flag',
        flag: 'it',
        short: 'i',
        description: '交互模式'
      }, {
        id: '2',
        type: 'flag',
        flag: 'd',
        short: 'd',
        description: '后台运行'
      }, {
        id: '3',
        type: 'flag',
        flag: 'p',
        short: 'p',
        description: '端口映射'
      }, {
        id: '4',
        type: 'flag',
        flag: 'v',
        short: 'v',
        description: '挂载卷'
      }, {
        id: '5',
        type: 'flag',
        flag: 'e',
        short: 'e',
        description: '环境变量'
      }, {
        id: '6',
        type: 'value',
        flag: 'name',
        description: '容器名称'
      }]
    }]
  }
}