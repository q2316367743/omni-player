// 导出语言列表与语言支持
import * as monaco from 'monaco-editor';
import { registerBatLanguage } from '@/modules/monaco/bat';
import { registerNginxLanguage } from '@/modules/monaco/nginx';
import { registerPowerShellLanguage } from '@/modules/monaco/ps1';

export type MonacoLanguage = string;

export const getMonacoLanguages = (): MonacoLanguage[] => {
  const languages = monaco.languages.getLanguages();
  return languages
    .map(lang => lang.id)
    .slice(0, 30);
};

export const MONACO_LANGUAGES: MonacoLanguage[] = [
  'plaintext',
  'json',
  'javascript',
  'typescript',
  'html',
  'css',
  'xml',
  'markdown',
  'python',
  'java',
  'csharp',
  'cpp',
  'go',
  'rust',
  'php',
  'ruby',
  'sql',
  'yaml',
  'toml',
  'ini',
  'dockerfile',
  'bat',
  'bash',
  'powershell',
  'nginx',
  'apacheconf',
  'lua',
  'perl',
  'r',
  'scala',
  'swift'
];

export function registerMonacoLanguages() {
  registerBatLanguage();
  registerNginxLanguage();
  registerPowerShellLanguage();
}
