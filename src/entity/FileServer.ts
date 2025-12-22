export type FileServerType = "WEBDAV" | "OPEN_LIST" | "A_LIST";

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