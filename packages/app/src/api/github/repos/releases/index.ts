// https://api.github.com/repos/{owner}/{repo}/releases
import {getAction} from "@/lib/http.ts";
import type {RepoRelease} from "@/api/github/repos/releases/latest.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

export async function reposReleases(owner: string, repo: string): Promise<Array<RepoRelease>> {
  const {githubToken} = useSettingStore().globalSetting;
  try {
    const {data} = await getAction<Array<RepoRelease>>(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      undefined,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
        }
      })
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}