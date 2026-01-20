

import type { ParserEngine, ParseContext, ParseNode, ParseStrategy, ContentExtractor } from './types';
import { DefaultParseContext } from './context';
import type { RequestConfig } from '../shard/RequestConfig';

export abstract class AbstractParseEngine implements ParserEngine {
  protected context: ParseContext;
  protected abstract readonly strategies: ParseStrategy[];
  protected abstract readonly extractors: ContentExtractor[];

  constructor(context?: ParseContext) {
    this.context = context || new DefaultParseContext();
  }

  getContext(): ParseContext {
    return this.context;
  }

  abstract parseToString(rule: string): string;
  abstract parseToEngines(rule: string): Array<ParserEngine>;
  abstract parseRegexToStrings(regex: string, selects: Array<string | undefined>): Array<Array<string>>;

  protected parseInternal(rule: string, nodes: Array<ParseNode>): Array<ParseNode> {
    if (!rule || nodes.length === 0) {
      return [];
    }

    let currentRule = rule;
    let currentNodes = nodes;

    const { preprocessedRule, jsCode, replaceRegex, replaceTarget } = this.preprocessRule(currentRule);

    currentRule = preprocessedRule;
    currentNodes = this.applyStrategies(currentRule, currentNodes);

    if (replaceRegex) {
      currentNodes = this.applyRegexFilter(currentNodes, replaceRegex, replaceTarget);
    }

    if (jsCode) {
      currentNodes = this.applyJsCode(currentNodes, jsCode);
    }

    return currentNodes;
  }

  protected preprocessRule(rule: string): {
    preprocessedRule: string;
    jsCode: string | null;
    replaceRegex: string | null;
    replaceTarget: string;
  } {
    let jsCode: string | null = null;
    let replaceRegex: string | null = null;
    let replaceTarget = '';

    let processed = rule;

    if (processed.includes('@js:')) {
      const idx = processed.indexOf('@js:');
      jsCode = processed.substring(idx + 4);
      processed = processed.substring(0, idx);
    }

    processed = processed.replaceAll(/##.*(##)?.*$/g, (substring) => {
      const items = substring.split('##').filter(e => e.trim());
      replaceRegex = items[0] || '';
      replaceTarget = items[1] || '';
      return '';
    });

    return {
      preprocessedRule: processed,
      jsCode,
      replaceRegex,
      replaceTarget,
    };
  }

  protected applyStrategies(rule: string, nodes: Array<ParseNode>): Array<ParseNode> {
    if (!rule || nodes.length === 0) {
      return [];
    }

    if (/^@xpath:/i.test(rule)) {
      const xpath = rule.substring(7);
      return this.evaluateXPath(xpath, nodes);
    }

    if (/^@json:/i.test(rule) || /^\$\./.test(rule)) {
      const jsonPath = rule.replace(/^@json:/, '');
      return this.evaluateJsonPath(jsonPath, nodes);
    }

    if (/^@css:/i.test(rule)) {
      const css = rule.substring(5);
      return this.evaluateCSS(css, nodes);
    }

    return this.evaluateDefault(rule, nodes);
  }

  protected evaluateXPath(xpath: string, nodes: Array<ParseNode>): Array<ParseNode> {
    const results: Array<ParseNode> = [];
    for (const node of nodes) {
      results.push(...node.evaluateXPath(xpath));
    }
    return results;
  }

  protected evaluateJsonPath(jsonPath: string, nodes: Array<ParseNode>): Array<ParseNode> {
    throw new Error('JsonPath evaluation not supported for this engine');
  }

  protected evaluateCSS(css: string, nodes: Array<ParseNode>): Array<ParseNode> {
    const results: Array<ParseNode> = [];
    for (const node of nodes) {
      results.push(...node.querySelectorAll(css));
    }
    return results;
  }

  protected evaluateDefault(rule: string, nodes: Array<ParseNode>): Array<ParseNode> {
    const results: Array<ParseNode> = [];
    for (const node of nodes) {
      results.push(...node.querySelectorAll(rule));
    }
    return results;
  }

  protected applyRegexFilter(nodes: Array<ParseNode>, regex: string, replace: string): Array<ParseNode> {
    return nodes;
  }

  protected applyJsCode(nodes: Array<ParseNode>, jsCode: string): Array<ParseNode> {
    try {
      const result = eval(jsCode);
      if (typeof result === 'string') {
        return this.createNodesFromString(result);
      }
      if (Array.isArray(result)) {
        return result.map(item => this.createNodeFromValue(item)).filter((n): n is ParseNode => n !== null);
      }
      const node = this.createNodeFromValue(result);
      return node ? [node] : [];
    } catch (e) {
      console.error('JS execution error:', e);
      return [];
    }
  }

  protected abstract createNodeFromValue(value: any): ParseNode | null;
  protected abstract createNodesFromString(value: string): Array<ParseNode>;

  protected extractContent(node: ParseNode, rule: string): string {
    for (const extractor of this.extractors) {
      if (extractor.canExtract(rule)) {
        const result = extractor.extract(node, rule);
        if (typeof result === 'string') {
          return result;
        }
        return result.join('\n');
      }
    }

    if (rule === 'text' || rule === 'ownText') {
      return node.getTextContent();
    } else if (rule === 'textNodes') {
      return this.extractTextNodes(node);
    } else if (rule === 'html') {
      return node.getOuterHTML();
    } else if (rule === 'all') {
      return node.getOuterHTML();
    } else {
      const attr = node.getAttribute(rule);
      return attr || '';
    }
  }

  protected extractTextNodes(node: ParseNode): string {
    const texts: string[] = [];
    const children = node.getChildren();
    for (const child of children) {
      if (child.getChildren().length === 0) {
        texts.push(child.getTextContent());
      }
    }
    return texts.join('\n');
  }

  protected handleReversal(nodes: Array<ParseNode>, rule: string): Array<ParseNode> {
    if (rule.startsWith('-')) {
      rule = rule.substring(1);
      return nodes.reverse();
    }
    return nodes;
  }

  protected parseConnector(nodes: Array<ParseNode>, rule: string, handler: (n: Array<ParseNode>, r: string) => Array<ParseNode>): Array<ParseNode> {
    const orParts = rule.split('||');
    if (orParts.length > 1) {
      for (const part of orParts) {
        const result = handler(nodes, part.trim());
        if (result.length > 0) {
          return result;
        }
      }
      return [];
    }

    const andParts = rule.split('&&');
    if (andParts.length > 1) {
      const results: Array<ParseNode>[] = [];
      for (const part of andParts) {
        results.push(handler(nodes, part.trim()));
      }
      return results.flat();
    }

    const turnParts = rule.split('%%');
    if (turnParts.length > 1) {
      const results: Array<Array<ParseNode>> = [];
      const maxLength = Math.max(...turnParts.map(p => handler(nodes, p.trim()).length));
      for (let i = 0; i < maxLength; i++) {
        for (const part of turnParts) {
          const result = handler(nodes, part.trim());
          if (result[i]) {
            results.push([result[i]!]);
          }
        }
      }
      return results.flat();
    }

    return handler(nodes, rule);
  }

  protected parseIndex(nodes: Array<ParseNode>, rule: string): Array<ParseNode> {
    let processedRule = rule;
    let matchIndexes: number[] = [];
    let ignoreIndexes: number[] = [];

    if (/\.-?\d+$/.test(processedRule)) {
      processedRule = processedRule.replaceAll(/\.-?\d+$/g, (substring) => {
        const index = parseInt(substring.substring(1));
        matchIndexes.push(index);
        return '';
      });
    } else if (/\[-?\d+:-?\d+:-?\d+]|\[-?\d+]|\[-?\d+:-?\d+]/.test(processedRule)) {
      if (!processedRule.startsWith('//')) {
        processedRule = processedRule.replaceAll(/\[-?\d+:-?\d+:-?\d+]|\[-?\d+]|\[-?\d+:-?\d+]/g, (substring) => {
          const parts = substring.substring(1, substring.length - 1).split(':');
          const start = parseInt(parts[0] || '0');
          const end = parseInt(parts[1] || '-1');
          const step = parseInt(parts[2] || '1');
          for (let i = start; i < (end < 0 ? nodes.length + end + 1 : end); i += step) {
            matchIndexes.push(i);
          }
          return '';
        });
      }
    } else if (/!-?\d+(:-?\d+)*/.test(processedRule)) {
      processedRule = processedRule.replaceAll(/!-?\d+(:-?\d+)*/g, (substring) => {
        const indexes = substring.substring(1).split(':');
        for (const index of indexes) {
          ignoreIndexes.push(parseInt(index));
        }
        return '';
      });
    } else if (/\[[\-!\d,]+]/.test(processedRule)) {
      processedRule = processedRule.replaceAll(/\[[\-!\d,]+]/g, (substring) => {
        const items = substring.substring(1, substring.length - 1).split(',');
        for (const item of items) {
          if (item.startsWith('!')) {
            ignoreIndexes.push(parseInt(item.substring(1)));
          } else {
            matchIndexes.push(parseInt(item));
          }
        }
        return '';
      });
    }

    matchIndexes = matchIndexes.map(i => i < 0 ? nodes.length + i : i);
    ignoreIndexes = ignoreIndexes.map(i => i < 0 ? nodes.length + i : i);

    return nodes.filter((_, index) => {
      if (ignoreIndexes.includes(index)) {
        return false;
      }
      if (matchIndexes.length > 0 && !matchIndexes.includes(index)) {
        return false;
      }
      return true;
    });
  }
}
