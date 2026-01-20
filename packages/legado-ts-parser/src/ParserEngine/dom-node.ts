import type { ParseNode, ParseSourceType, ParseContext } from './types';

export class DomParseNode implements ParseNode {
  readonly type: ParseSourceType = 'dom';
  private element: Element;
  private ownerEngine: any;

  constructor(element: Element, ownerEngine?: any) {
    this.element = element;
    this.ownerEngine = ownerEngine;
  }

  getRawContent(): string {
    return this.element.outerHTML;
  }

  querySelector(selector: string): Array<ParseNode> {
    const results: Array<ParseNode> = [];
    try {
      const elements = this.element.querySelectorAll(selector);
      for (let i = 0; i < elements.length; i++) {
        const el = elements.item(i);
        if (el) {
          results.push(new DomParseNode(el, this.ownerEngine));
        }
      }
    } catch (e) {
      console.error('querySelector error:', e);
    }
    return results;
  }

  querySelectorAll(selector: string): Array<ParseNode> {
    return this.querySelector(selector);
  }

  getAttribute(name: string): string | null {
    return this.element.getAttribute(name);
  }

  getTextContent(): string {
    return this.element.textContent || '';
  }

  getOuterHTML(): string {
    return this.element.outerHTML;
  }

  getChildren(): Array<ParseNode> {
    const results: Array<ParseNode> = [];
    for (let i = 0; i < this.element.children.length; i++) {
      const el = this.element.children.item(i);
      if (el) {
        results.push(new DomParseNode(el, this.ownerEngine));
      }
    }
    return results;
  }

  evaluateXPath(xpath: string): Array<ParseNode> {
    const results: Array<ParseNode> = [];
    try {
      const iterator = document.evaluate(xpath, this.element, null, XPathResult.ANY_TYPE, null);
      let node = iterator.iterateNext();
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          results.push(new DomParseNode(node as Element, this.ownerEngine));
        }
        node = iterator.iterateNext();
      }
    } catch (e) {
      console.error('XPath evaluation error:', e);
    }
    return results;
  }

  getElement(): Element {
    return this.element;
  }

  matches(selector: string): boolean {
    if (typeof (this.element as any).matches === 'function') {
      return (this.element as any).matches(selector);
    }
    return false;
  }

  getOwnerEngine(): any {
    return this.ownerEngine;
  }

  setOwnerEngine(engine: any): void {
    this.ownerEngine = engine;
  }
}

export function elementsToNodes(elements: Array<Element>, ownerEngine?: any): Array<DomParseNode> {
  return elements.map(el => new DomParseNode(el, ownerEngine));
}

export function nodeToElement(node: ParseNode): Element | null {
  if (node instanceof DomParseNode) {
    return node.getElement();
  }
  return null;
}
