import 'vite/client';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

declare module 'jinrishici' {
  export interface JinrishiciResult {
    status: string;
    data: {
      content: string[];
      origin: {
        title: string;
        dynasty: string;
        author: string;
        content: string[];
        translate: string[];
      };
      matchTags: string[];
    };
  }

  export function load(callback: (result: JinrishiciResult) => void): void;
}

declare module 'lunar-javascript' {
  export class Lunar {
    static fromDate(date: Date): Lunar;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getJieQi(): string | null;
  }
}
