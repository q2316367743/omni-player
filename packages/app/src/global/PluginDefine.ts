export interface PluginDefine {
  identifier:string;
  name: string;
  main: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  window?: {
    title?: string;
    icon?: string;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    resizable?: boolean;
    singleton?: boolean;
  };
  permissions?: Array<'fs' | 'net' | 'clipboard'>;
  development?: {
    main?: string;
  };
  require?: {
    version?: string
  };
  lifeCycle?: {
    install?: string;
    uninstall?: string;
    update?: string;
  }
}