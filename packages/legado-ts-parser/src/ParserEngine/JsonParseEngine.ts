import type { ParserEngine, ParseContext, ParseNode, ParseStrategy, ContentExtractor } from './types';
import { AbstractParseEngine } from './abstract';
import { JsonParseNode, createJsonNode, createJsonNodesFromArray } from './json-node';
import { DefaultParseContext } from './context';
import { parseRegexToStrings } from './util';

const JsonContentExtractor: ContentExtractor = {
  canExtract(rule: string): boolean {
    return rule.startsWith('$.') || rule.startsWith('@json:') || !rule.includes('@');
  },
  extract(node: JsonParseNode, rule: string): string {
    if (rule.startsWith('$.') || rule.startsWith('@json:')) {
      const jsonPath = rule.replace(/^@json:/, '');
      const results = node.evaluateJsonPath(jsonPath);
      return results.map(n => n.getTextContent()).join('\n');
    }
    return node.getTextContent();
  }
};

const JsonPathParseStrategy: ParseStrategy = {
  sign: '$.',
  priority: 10,
  canHandle(rule: string): boolean {
    return rule.startsWith('$.') || rule.startsWith('@json:');
  },
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode> {
    const jsonPath = rule.replace(/^@json:/, '');
    const results: Array<JsonParseNode> = [];
    for (const node of nodes) {
      if (node instanceof JsonParseNode) {
        results.push(...node.evaluateJsonPath(jsonPath));
      }
    }
    return results;
  }
};

const ObjectKeyParseStrategy: ParseStrategy = {
  sign: '',
  priority: 1,
  canHandle(rule: string): boolean {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(rule) && !rule.includes('.');
  },
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode> {
    const results: Array<JsonParseNode> = [];
    for (const node of nodes) {
      if (node instanceof JsonParseNode) {
        results.push(...node.querySelector(rule));
      }
    }
    return results;
  }
};

const ArrayIndexParseStrategy: ParseStrategy = {
  sign: '[',
  priority: 10,
  canHandle(rule: string): boolean {
    return /^\[-?\d+\]$/.test(rule) || /^\[-?\d+:-?\d+\]$/.test(rule) || /^\[-?\d+:-?\d+:-?\d+\]$/.test(rule);
  },
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode> {
    const results: Array<JsonParseNode> = [];
    const indexMatch = rule.match(/\[(-?\d+)(?::(-?\d+)(?::(-?\d+))?)?\]/);
    
    if (!indexMatch) {
      return results;
    }
    
    const start = parseInt(indexMatch[1] || '0');
    const endStr = indexMatch[2];
    const stepStr = indexMatch[3];
    const end = endStr !== undefined ? parseInt(endStr) : undefined;
    const step = stepStr !== undefined ? parseInt(stepStr) : 1;
    
    for (const node of nodes) {
      if (node instanceof JsonParseNode && node.isArray()) {
        const data = node.getData();
        const dataLength = data.length;
        const actualEnd = end === undefined ? dataLength : (end < 0 ? dataLength + end : end);
        
        for (let i = start; i < actualEnd; i += step) {
          if (i >= 0 && i < dataLength) {
            results.push(createJsonNode(data[i], node.getPath() + `[${i}]`));
          }
        }
      }
    }
    
    return results;
  }
};

export class JsonParseEngine extends AbstractParseEngine {
  private readonly rootNode: JsonParseNode;
  protected readonly strategies: ParseStrategy[] = [
    JsonPathParseStrategy,
    ArrayIndexParseStrategy,
    ObjectKeyParseStrategy,
  ];
  protected readonly extractors: ContentExtractor[] = [JsonContentExtractor];

  constructor(json: string | Record<string, any> | Array<any>, context?: ParseContext) {
    super(context);
    let data: any;
    if (typeof json === 'string') {
      try {
        data = JSON.parse(json);
      } catch (e) {
        console.error('JSON parse error:', e);
        data = {};
      }
    } else {
      data = json;
    }
    this.rootNode = new JsonParseNode(data, '$');
    this.rootNode.setOwnerEngine(this);
  }

  parseToString(rule: string): string {
    if (!rule) {
      return '';
    }
    try {
      return this.parseToStringInternal(rule);
    } catch (e) {
      console.error(`JSON解析规则【${rule}】出错`, e);
      return '';
    }
  }

  private parseToStringInternal(rule: string): string {
    let processedRule = rule;
    let jsCode: string | null = null;
    let replaceRegex: string | null = null;
    let replaceTarget = '';

    if (processedRule.includes('@js:')) {
      const idx = processedRule.indexOf('@js:');
      jsCode = processedRule.substring(idx + 4);
      processedRule = processedRule.substring(0, idx);
    }

    processedRule = processedRule.replaceAll(/##.*(##)?.*$/g, (substring) => {
      const items = substring.split('##').filter(e => e.trim());
      replaceRegex = items[0] || '';
      replaceTarget = items[1] || '';
      return '';
    });

    let result = this.applyParseRule(processedRule);

    if (replaceRegex) {
      result = result.replaceAll(new RegExp(replaceRegex, 'g'), replaceTarget);
    }

    if (jsCode) {
      result = this.executeJs(jsCode, result);
    }

    return result;
  }

  private applyParseRule(rule: string): string {
    return this.parseConnectorString([this.rootNode], rule);
  }

  private parseConnectorString(nodes: Array<ParseNode>, rule: string): string {
    const orParts = rule.split('||');
    if (orParts.length > 1) {
      for (const part of orParts) {
        const result = this.parseConnectorString(nodes, part.trim());
        if (result.length > 0) {
          return result;
        }
      }
      return '';
    }

    const andParts = rule.split('&&');
    if (andParts.length > 1) {
      return andParts.map(part => this.parseConnectorString(nodes, part.trim())).join('');
    }

    const turnParts = rule.split('%%');
    if (turnParts.length > 1) {
      const results: string[][] = [];
      const maxLength = Math.max(...turnParts.map(p => {
        const result = this.parseConnectorString(nodes, p.trim());
        return result ? result.split('\n').length : 0;
      }));
      for (let i = 0; i < maxLength; i++) {
        for (const part of turnParts) {
          const trimmedPart = part.trim();
          if (!trimmedPart) continue;
          const lines = this.parseConnectorString(nodes, trimmedPart).split('\n');
          if (lines[i] !== undefined) {
            results.push([lines[i]!]);
          }
        }
      }
      return results.map(r => r.join('')).join('\n');
    }

    return this.applyStrategies(rule, nodes).map(n => this.extractContent(n, rule)).join('');
  }

  parseToEngines(rule: string): Array<ParserEngine> {
    if (!rule) {
      return [];
    }
    try {
      return this.parseToEnginesInternal(rule);
    } catch (e) {
      console.error(`JSON引擎解析规则【${rule}】出错`, e);
      return [];
    }
  }

  private parseToEnginesInternal(rule: string): Array<ParserEngine> {
    let processedRule = rule;
    let reversal = false;

    if (processedRule.startsWith('-')) {
      reversal = true;
      processedRule = processedRule.substring(1);
    }

    let nodes: Array<ParseNode> = [];

    if (/^@js:/i.test(processedRule)) {
      throw new Error('JS parsing not fully supported in parseToEngines');
    } else {
      nodes = this.applyStrategies(processedRule, [this.rootNode]);
      nodes = this.parseIndex(nodes, processedRule);
    }

    if (reversal) {
      nodes.reverse();
    }

    return nodes.map(node => {
      if (node instanceof JsonParseNode) {
        return new JsonParseEngine(node.getData(), this.context) as ParserEngine;
      }
      throw new Error('Cannot create engine from non-JSON node');
    });
  }

  parseRegexToStrings(regex: string, selects: Array<string | undefined>): Array<Array<string>> {
    const jsonString = JSON.stringify(this.rootNode.getData());
    return parseRegexToStrings(regex, selects, jsonString);
  }

  protected createNodeFromValue(value: any): ParseNode | null {
    return new JsonParseNode(value);
  }

  protected createNodesFromString(value: string): Array<ParseNode> {
    try {
      const data = JSON.parse(value);
      if (Array.isArray(data)) {
        return createJsonNodesFromArray(data);
      }
      return [new JsonParseNode(data)];
    } catch (e) {
      console.error('Failed to create nodes from string:', e);
      return [];
    }
  }

  private executeJs(jsCode: string, input: string): string {
    const engines: Array<ParserEngine> = [new JsonParseEngine(input, this.context)];
    try {
      return eval(jsCode);
    } catch (e) {
      console.error('JS execution error:', e);
      return input;
    }
  }

  getRootData(): any {
    return this.rootNode.getData();
  }

  getRootNode(): JsonParseNode {
    return this.rootNode;
  }
}

export function buildJsonEngine(json: string | Record<string, any> | Array<any>, context?: ParseContext): JsonParseEngine {
  return new JsonParseEngine(json, context);
}
