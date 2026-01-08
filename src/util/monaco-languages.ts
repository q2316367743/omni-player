import * as monaco from 'monaco-editor';

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
