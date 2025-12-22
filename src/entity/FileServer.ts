export type FileServerType = "WEBDAV" | "OPEN_LIST" | "A_LIST";

export const FileServerTypeOptions = [
  {label: "OpenList", value: "OPEN_LIST"},
  {label: "WebDAV", value: "WEBDAV"},
  {label: "AList", value: "A_LIST"},
];

export const FileServerTypeLabel: Record<FileServerType, string> = {
  OPEN_LIST: "OpenList",
  WEBDAV: "WebDAV",
  A_LIST: "AList",
};

export interface FileServerBase {

  name: string;
  url: string;
  type: FileServerType;
}

export interface FileServerEdit extends FileServerBase{

  username: string;
  password: string;
}

export interface FileServer extends FileServerBase{
  id: string;
  created_at: number;
  updated_at: number;

  name: string;
  url: string;
  type: FileServerType;

  // 存储密钥
  // username: string;
  // password: string;
}

export interface FileServerEntry extends FileServer{

  // 存储密钥
  username?: string | null;
  password?: string | null;
}

export function buildFileServerEdit(): FileServerEdit {
  return {
    name: "",
    url: "",
    type: "OPEN_LIST",
    username: "",
    password: "",
  };
}
