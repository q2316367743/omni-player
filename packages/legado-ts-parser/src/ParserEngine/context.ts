import type { ParseContext } from './types';

export class DefaultParseContext implements ParseContext {
  variables: Map<string, any> = new Map();
  private _baseUrl: string = '';

  put(key: string, value: any): void {
    this.variables.set(key, value);
  }

  get(key: string): any {
    return this.variables.get(key);
  }

  getBaseUrl(): string {
    return this._baseUrl;
  }

  setBaseUrl(url: string): void {
    this._baseUrl = url;
  }

  getAllVariables(): ReadonlyMap<string, any> {
    return new Map(this.variables);
  }

  clearVariables(): void {
    this.variables.clear();
  }

  hasVariable(key: string): boolean {
    return this.variables.has(key);
  }

  removeVariable(key: string): boolean {
    return this.variables.delete(key);
  }
}

export class ChainedParseContext implements ParseContext {
  variables: Map<string, any> = new Map();
  private parent: ParseContext;

  constructor(parent: ParseContext) {
    this.parent = parent;
  }

  put(key: string, value: any): void {
    this.variables.set(key, value);
  }

  get(key: string): any {
    if (this.variables.has(key)) {
      return this.variables.get(key);
    }
    return this.parent.get(key);
  }

  getBaseUrl(): string {
    return this.parent.getBaseUrl();
  }

  setBaseUrl(url: string): void {
    this.parent.setBaseUrl(url);
  }

  getLocalVariables(): ReadonlyMap<string, any> {
    return new Map(this.variables);
  }
}

let globalContext: ParseContext = new DefaultParseContext();

export function getGlobalContext(): ParseContext {
  return globalContext;
}

export function setGlobalContext(context: ParseContext): void {
  globalContext = context;
}
