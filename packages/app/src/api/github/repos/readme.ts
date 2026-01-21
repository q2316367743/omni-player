import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {getAction} from "@/lib/http.ts";

export interface RepoReadme {
  type: string;
  encoding: string;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string;
  _links: Links;
}

interface Links {
  git: string;
  self: string;
  html: string;
}

// https://api.github.com/repos/{owner}/{repo}/readme
export async function getReposReadme(owner: string, repo: string): Promise<RepoReadme> {
  const {githubToken} = useSettingStore().globalSetting;
  const {data} = await getAction<RepoReadme>(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    undefined,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${githubToken}`,
      }
    })
  return data;
}