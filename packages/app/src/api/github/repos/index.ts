import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {getAction} from "@/lib/http.ts";

export interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  license: License;
  topics: string[];
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks: number;
  watchers: number;
  open_issues: number;
}

interface License {
  key: string;
  name: string;
  url: string;
}

// https://api.github.com/repos/{owner}/{repo}
export async function getRepos(owner: string, repo: string): Promise<RepoInfo> {
  const {githubToken} = useSettingStore().globalSetting;
  const {data} = await getAction<RepoInfo>(
    `https://api.github.com/repos/${owner}/${repo}`,
    undefined,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${githubToken}`,
      }
    })
  return data;
}