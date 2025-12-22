import type {IFileServer} from "@/modules/file/IFileServer.ts";
import type {FileServerEntry, FileServerType} from "@/entity/FileServer.ts";
import {type FileItem, renderFileItemContent} from "@/modules/file/types/FileItem.ts";
import type {ListResult} from "@/modules/file/types/ListResult.ts";
import {SUPPORT_MOVIE} from "@/global/Constants.ts";
import {requestAction} from "@/lib/http.ts";
import {XMLParser} from "fast-xml-parser";

export class WebDavClient implements IFileServer {

  private readonly props: FileServerEntry;
  readonly type: FileServerType;
  private readonly parser: XMLParser;

  constructor(props: FileServerEntry) {
    this.props = props;
    this.type = props.type;
    this.parser = new XMLParser({
      removeNSPrefix: true,
      ignoreAttributes: false,
      parseTagValue: true,
      isArray: (name) => name === 'response',
    });
  }

  async connect(): Promise<void> {
    if (!(this.props.password && this.props.username)) {
      return Promise.reject(new Error("用户名或密码不能为空"));
    }
    try {
      await requestAction({
        url: this.props.url,
        method: 'PROPFIND',
        headers: {
          ...this.getAuthHeader(),
          Depth: '0'
        },
        responseType: 'text'
      });
    } catch {
      throw new Error("连接失败，请检查地址或账号密码");
    }
  }

  async disconnect(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async getMetadata(_file: FileItem): Promise<Record<string, any>> {
    // Optional: implement if needed using PROPFIND Depth 0
    return Promise.resolve(_file);
  }

  async getPlayableUrl(file: FileItem): Promise<string> {
    // MPV supports Basic Auth in URL: http://user:pass@host/path
    const url = new URL(this.props.url);

    // Combine base URL path with file path
    // Note: file.path from list() is typically the full path on server
    // But we need to be careful not to double the path if props.url already has it?
    // Let's look at how list() generates paths.

    // If we use the original URL and just append the relative path from root?
    // Actually, file.path usually comes from list() which parses href.
    // href is the full path.

    // If props.url is http://example.com/dav
    // And file.path is /dav/video.mp4 (from href)
    // Then the full URL is http://example.com/dav/video.mp4

    // So we just need to construct the URL with auth.

    // Remove trailing slash from origin to avoid double slash if path starts with /
    // Actually URL constructor handles it?
    // Let's use string manipulation to be safe and explicit.

    const protocol = url.protocol;
    const host = url.host;
    // user/pass need to be encoded
    const auth = `${encodeURIComponent(this.props.username || '')}:${encodeURIComponent(this.props.password || '')}`;

    // file.path should be the full path from server root (e.g. /dav/file.mp4)
    // Ensure file.path starts with /
    const path = file.path.startsWith('/') ? file.path : '/' + file.path;

    return `${protocol}//${auth}@${host}${path}`;
  }

  isPlayable(file: FileItem): boolean {
    if (file.isDirectory) return false;
    return SUPPORT_MOVIE.test(file.extname);
  }

  async list(path: string): Promise<ListResult> {
    // Construct URL for PROPFIND
    let url: string;
    if (path === '/') {
      url = this.props.url;
    } else if (path.startsWith('http://') || path.startsWith('https://')) {
      url = path;
    } else {
      const urlObj = new URL(this.props.url);
      url = `${urlObj.origin}${path}`;
    }

    const resp = await requestAction<string>({
      url,
      method: 'PROPFIND',
      headers: {
        ...this.getAuthHeader(),
        Depth: '1'
      },
      responseType: 'text'
    });

    const parsed = this.parser.parse(resp.data);
    const multistatus = parsed.multistatus;
    if (!multistatus) {
      return {content: [], total: 0};
    }

    const responses: any[] = multistatus.response || [];
    const items: FileItem[] = [];

    // Determine the "root" of this listing to filter it out (it's usually the first item)
    // Or just filter by path equality.

    // We need to normalize the requested path to compare with hrefs
    // But hrefs are absolute paths.

    for (const response of responses) {
      const href = decodeURIComponent(response.href);
      // Skip if it matches the requested URL's path (ignoring trailing slash)
      // We need to extract the path from 'url' variable above
      const reqUrlPath = new URL(url).pathname;

      // Normalize paths for comparison (remove trailing slashes)
      const normalizedHref = href.replace(/\/+$/, '');
      const normalizedReq = reqUrlPath.replace(/\/+$/, '');

      if (normalizedHref === normalizedReq) {
        continue; // Skip the directory itself
      }

      const propstat = Array.isArray(response.propstat) ? response.propstat[0] : response.propstat;
      const prop = propstat?.prop;

      if (!prop) continue;

      const isDirectory = prop.resourcetype && prop.resourcetype.collection !== undefined;
      const displayName = prop.displayname || this.basename(href);
      const size = parseInt(prop.getcontentlength || '0', 10);
      const lastMod = prop.getlastmodified;

      const [basename, extname] = displayName.split(".");

      items.push({
        id: href, // Use full href as ID
        name: displayName,
        basename: basename || displayName,
        extname: extname || '',
        isDirectory,
        size: isDirectory ? undefined : size,
        modifiedAt: lastMod,
        path: href, // Store full path
        extra: {
          etag: prop.getetag,
          contentType: prop.getcontenttype
        }
      });
    }

    return {
      content: renderFileItemContent(items),
      total: items.length
    };
  }

  private getAuthHeader() {
    if (this.props.username && this.props.password) {
      return {
        Authorization: `Basic ${btoa(`${this.props.username}:${this.props.password}`)}`
      };
    }
    return {};
  }

  private basename(path: string): string {
    const parts = path.split('/').filter(p => p);
    return parts[parts.length - 1] || '';
  }
}
