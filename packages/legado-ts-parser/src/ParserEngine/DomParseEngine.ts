import type { ParserEngine, ParseContext, ParseNode, ParseStrategy, ContentExtractor } from './types';
import { AbstractParseEngine } from './abstract';
import { DomParseNode, elementsToNodes, nodeToElement } from './dom-node';
import { DefaultParseContext } from './context';
import { parseRegexToStrings } from './util';
import { buildJava } from './java';
import type { RequestConfig } from '../shard/RequestConfig';

const DomContentExtractor: ContentExtractor = {
  canExtract(rule: string): boolean {
    return ['text', 'ownText', 'textNodes', 'html', 'all'].includes(rule) || rule.startsWith('@') || rule.startsWith('$') || /^[a-zA-Z]/.test(rule);
  },
  extract(node: ParseNode, rule: string): string {
    if (!(node instanceof DomParseNode)) {
      return '';
    }
    const element = node.getElement();
    if (rule === 'text' || rule === 'ownText') {
      return element.textContent || '';
    } else if (rule === 'textNodes') {
      const texts: string[] = [];
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes.item(i);
        if (child.nodeType === Node.TEXT_NODE) {
          texts.push(child.textContent || '');
        }
      }
      return texts.join('\n');
    } else if (rule === 'html') {
      return element.outerHTML;
    } else if (rule === 'all') {
      return element.outerHTML;
    } else {
      return element.getAttribute(rule) || '';
    }
  }
};

const TagParseStrategy: ParseStrategy = {
  sign: 'tag.',
  priority: 10,
  canHandle(rule: string): boolean {
    return rule.startsWith('tag.');
  },
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode> {
    const tag = rule.substring(4);
    const results: Array<ParseNode> = [];
    for (const node of nodes) {
      if (node instanceof DomParseNode) {
        const elements = node.getElement().getElementsByTagName(tag);
        for (let i = 0; i < elements.length; i++) {
          const el = elements.item(i);
          if (el) {
            results.push(new DomParseNode(el));
          }
        }
      }
    }
    return results;
  }
};

const ClassParseStrategy: ParseStrategy = {
  sign: 'class.',
  priority: 10,
  canHandle(rule: string): boolean {
    return rule.startsWith('class.');
  },
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode> {
    const className = rule.substring(6);
    const results: Array<ParseNode> = [];
    for (const node of nodes) {
      if (node instanceof DomParseNode) {
        const elements = node.getElement().getElementsByClassName(className);
        for (let i = 0; i < elements.length; i++) {
          const el = elements.item(i);
          if (el) {
            results.push(new DomParseNode(el));
          }
        }
      }
    }
    return results;
  }
};

const IdParseStrategy: ParseStrategy = {
  sign: 'id.',
  priority: 10,
  canHandle(rule: string): boolean {
    return rule.startsWith('id.');
  },
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode> {
    const id = rule.substring(3);
    const results: Array<ParseNode> = [];
    for (const node of nodes) {
      if (node instanceof DomParseNode) {
        const element = node.getElement().querySelector(`#${id}`);
        if (element) {
          results.push(new DomParseNode(element));
        }
      }
    }
    return results;
  }
};

const TextParseStrategy: ParseStrategy = {
  sign: 'text.',
  priority: 10,
  canHandle(rule: string): boolean {
    return rule.startsWith('text.');
  },
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode> {
    const text = rule.substring(5);
    const results: Array<ParseNode> = [];
    function searchInChildren(element: Element, targetText: string): void {
      if ((element.textContent || '').trim() === targetText) {
        results.push(new DomParseNode(element));
      }
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children.item(i);
        if (child) {
          searchInChildren(child, targetText);
        }
      }
    }
    for (const node of nodes) {
      if (node instanceof DomParseNode) {
        const element = node.getElement();
        if ((element.textContent || '').trim() === text) {
          results.push(node);
        }
        searchInChildren(element, text);
      }
    }
    return results;
  }
};

const ChildrenParseStrategy: ParseStrategy = {
  sign: 'children',
  priority: 10,
  canHandle(rule: string): boolean {
    return rule === 'children';
  },
  parse(rule: string, context: ParseContext, nodes: Array<ParseNode>): Array<ParseNode> {
    const results: Array<ParseNode> = [];
    for (const node of nodes) {
      results.push(...node.getChildren());
    }
    return results;
  }
};

export class DomParseEngine extends AbstractParseEngine {
  private readonly rootNodes: Array<DomParseNode>;
  protected readonly strategies: ParseStrategy[] = [
    TagParseStrategy,
    ClassParseStrategy,
    IdParseStrategy,
    TextParseStrategy,
    ChildrenParseStrategy,
  ];
  protected readonly extractors: ContentExtractor[] = [DomContentExtractor];

  constructor(html: string | Element | Array<Element>, context?: ParseContext) {
    super(context);
    this.rootNodes = this.parseRootContent(html);
    this.rootNodes.forEach(node => node.setOwnerEngine(this));
  }

  private parseRootContent(html: string | Element | Array<Element>): Array<DomParseNode> {
    if (typeof html === 'string') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return elementsToNodes(Array.from(doc.body.children));
    } else if (Array.isArray(html)) {
      return elementsToNodes(html);
    } else {
      return [new DomParseNode(html)];
    }
  }

  parseToString(rule: string): string {
    if (!rule) {
      return '';
    }
    try {
      return this.parseToStringInternal(rule);
    } catch (e) {
      console.error(`DOM解析规则【${rule}】出错`, e);
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
    if (/^@xpath:/i.test(rule)) {
      const xpath = rule.substring(7);
      const nodes = this.evaluateXPath(xpath, this.rootNodes);
      return nodes.map(n => this.extractContent(n, '')).join('');
    }

    if (/^@css:/i.test(rule)) {
      const css = rule.substring(5);
      const nodes = this.evaluateCSS(css, this.rootNodes);
      return nodes.map(n => this.extractContent(n, '')).join('');
    }

    return this.parseConnectorString(this.rootNodes, rule);
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

    const splitParts = rule.split('@');
    let currentNodes = nodes;
    for (let i = 0; i < splitParts.length - 1; i++) {
      const part = splitParts[i]!;
      currentNodes = this.parseIndex(currentNodes, part);
      currentNodes = this.applyStrategies(part, currentNodes);
    }
    const lastPart = splitParts[splitParts.length - 1] || '';
    return currentNodes.map(n => this.extractContent(n, lastPart)).join('');
  }

  parseToEngines(rule: string): Array<ParserEngine> {
    if (!rule) {
      return [];
    }
    try {
      return this.parseToEnginesInternal(rule);
    } catch (e) {
      console.error(`DOM引擎解析规则【${rule}】出错`, e);
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

    if (/^@xpath:/i.test(processedRule)) {
      const xpath = processedRule.substring(7);
      nodes = this.evaluateXPath(xpath, this.rootNodes);
    } else if (/^@js:/i.test(processedRule)) {
      throw new Error('JS parsing not fully supported in parseToEngines');
    } else {
      nodes = this.applyStrategies(processedRule, this.rootNodes);
      nodes = this.parseIndex(nodes, processedRule);
    }

    if (reversal) {
      nodes.reverse();
    }

    return nodes.map(node => {
      if (node instanceof DomParseNode) {
        return new DomParseEngine(node.getElement(), this.context) as ParserEngine;
      }
      throw new Error('Cannot create engine from non-DOM node');
    });
  }

  parseRegexToStrings(regex: string, selects: Array<string | undefined>): Array<Array<string>> {
    const html = this.rootNodes.map(n => n.getOuterHTML()).join('\n');
    return parseRegexToStrings(regex, selects, html);
  }

  protected createNodeFromValue(value: any): ParseNode | null {
    if (value instanceof Element) {
      return new DomParseNode(value);
    }
    if (value instanceof Node) {
      if (value.nodeType === Node.ELEMENT_NODE) {
        return new DomParseNode(value as Element);
      }
    }
    return null;
  }

  protected createNodesFromString(value: string): Array<ParseNode> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');
    return elementsToNodes(Array.from(doc.body.children));
  }

  private executeJs(jsCode: string, input: string): string {
    const engines: Array<ParserEngine> = [new DomParseEngine(input, this.context)];
    try {
      const java = buildJava(engines);
      return eval(jsCode);
    } catch (e) {
      console.error('JS execution error:', e);
      return input;
    }
  }
}

export function buildDomEngine(html: string | Element | Array<Element>, context?: ParseContext): DomParseEngine {
  return new DomParseEngine(html, context);
}
