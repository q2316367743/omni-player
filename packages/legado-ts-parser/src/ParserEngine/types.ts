
export type ParseSourceType = 'dom' | 'json' | 'text';

export interface ParseNode {
  type: ParseSourceType;
  getRawContent(): string;
  querySelector(selector: string): Array<ParseNode>;
  querySelectorAll(selector: string): Array<ParseNode>;
  getAttribute(name: string): string | null;
  getTextContent(): string;
  getOuterHTML(): string;
  getChildren(): Array<ParseNode>;
  evaluateXPath(xpath: string): Array<ParseNode>;
}

export interface ParserEngine {
  parseToString(rule: string): string;
  parseToEngines(rule: string): Array<ParserEngine>;
  parseRegexToStrings(regex: string, selects: Array<string | undefined>): Array<Array<string>>;
  getContext(): ParseContext;
}

export interface ParseContext {
  variables: Map<string, any>;
  put(key: string, value: any): void;
  get(key: string): any;
  getBaseUrl(): string;
  setBaseUrl(url: string): void;
}

export interface ParseResult {
  nodes: Array<ParseNode>;
  lastRule: string;
}

export interface ParseStrategy {
  sign: string;
  priority: number;
  canHandle(rule: string): boolean;
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode>;
}

export interface ContentExtractor {
  canExtract(rule: string): boolean;
  extract(node: ParseNode, rule: string): string | Array<string>;
}

export interface RulePreprocessor {
  canProcess(rule: string): boolean;
  process(rule: string, context: ParseContext): string;
}

export interface EngineFactory {
  type: ParseSourceType;
  create(source: string | Record<string, any>): ParserEngine;
  canHandle(source: string | Record<string, any>): boolean;
}

