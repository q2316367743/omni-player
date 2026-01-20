import type { ParseNode, ParseSourceType } from './types';

export class JsonParseNode implements ParseNode {
  readonly type: ParseSourceType = 'json';
  private data: any;
  private path: string;
  private ownerEngine: any;

  constructor(data: any, path: string = '', ownerEngine?: any) {
    this.data = data;
    this.path = path;
    this.ownerEngine = ownerEngine;
  }

  getRawContent(): string {
    return JSON.stringify(this.data);
  }

  querySelector(selector: string): Array<JsonParseNode> {
    if (typeof this.data !== 'object' || this.data === null) {
      return [];
    }

    if (selector.startsWith('$.')) {
      return this.evaluateJsonPath(selector);
    }

    if (selector.startsWith('@json:')) {
      return this.evaluateJsonPath(selector.substring(5));
    }

    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(selector)) {
      if (Array.isArray(this.data)) {
        return this.data.map((item, index) => 
          new JsonParseNode(item, `${this.path}[${index}]`, this.ownerEngine)
        );
      } else if (typeof this.data === 'object' && this.data !== null) {
        if (selector in this.data) {
          return [new JsonParseNode(this.data[selector], `${this.path}.${selector}`, this.ownerEngine)];
        }
      }
    }

    return [];
  }

  querySelectorAll(selector: string): Array<JsonParseNode> {
    return this.querySelector(selector);
  }

  getAttribute(name: string): string | null {
    if (typeof this.data === 'object' && this.data !== null && name in this.data) {
      return String(this.data[name]);
    }
    return null;
  }

  getTextContent(): string {
    if (typeof this.data === 'string' || typeof this.data === 'number') {
      return String(this.data);
    }
    if (typeof this.data === 'boolean') {
      return String(this.data);
    }
    if (this.data === null) {
      return 'null';
    }
    return JSON.stringify(this.data);
  }

  getOuterHTML(): string {
    return JSON.stringify(this.data, null, 2);
  }

  getChildren(): Array<JsonParseNode> {
    const results: Array<JsonParseNode> = [];
    
    if (Array.isArray(this.data)) {
      for (let i = 0; i < this.data.length; i++) {
        results.push(new JsonParseNode(this.data[i], `${this.path}[${i}]`, this.ownerEngine));
      }
    } else if (typeof this.data === 'object' && this.data !== null) {
      for (const key of Object.keys(this.data)) {
        results.push(new JsonParseNode(this.data[key], `${this.path}.${key}`, this.ownerEngine));
      }
    }
    
    return results;
  }

  evaluateXPath(xpath: string): Array<JsonParseNode> {
    console.warn('XPath is not supported for JSON nodes');
    return [];
  }

  evaluateJsonPath(jsonPath: string): Array<JsonParseNode> {
    const results: Array<JsonParseNode> = [];
    
    try {
      const func = new Function('$', `return ${jsonPath}`);
      const result = func(this.data);
      
      if (Array.isArray(result)) {
        for (let i = 0; i < result.length; i++) {
          results.push(new JsonParseNode(result[i], `${this.path}${jsonPath}[${i}]`, this.ownerEngine));
        }
      } else if (result !== undefined) {
        results.push(new JsonParseNode(result, `${this.path}${jsonPath}`, this.ownerEngine));
      }
    } catch (e) {
      console.error('JsonPath evaluation error:', e);
    }
    
    return results;
  }

  getData(): any {
    return this.data;
  }

  getPath(): string {
    return this.path;
  }

  getOwnerEngine(): any {
    return this.ownerEngine;
  }

  setOwnerEngine(engine: any): void {
    this.ownerEngine = engine;
  }

  isArray(): boolean {
    return Array.isArray(this.data);
  }

  isObject(): boolean {
    return typeof this.data === 'object' && this.data !== null && !Array.isArray(this.data);
  }

  getKeys(): string[] {
    if (this.isObject()) {
      return Object.keys(this.data);
    }
    return [];
  }

  getLength(): number {
    if (Array.isArray(this.data)) {
      return this.data.length;
    }
    return 0;
  }
}

export function createJsonNode(data: any, path: string = '', ownerEngine?: any): JsonParseNode {
  return new JsonParseNode(data, path, ownerEngine);
}

export function createJsonNodesFromArray(data: Array<any>, basePath: string = '', ownerEngine?: any): Array<JsonParseNode> {
  return data.map((item, index) => new JsonParseNode(item, `${basePath}[${index}]`, ownerEngine));
}
