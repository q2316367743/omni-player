import type { ParserEngine, ParseSourceType, ParseContext } from './types';
import { DomParseEngine } from './DomParseEngine';
import { JsonParseEngine } from './JsonParseEngine';
import { DefaultParseContext } from './context';

interface EngineFactory {
  type: ParseSourceType;
  create(source: string | Record<string, any>, context?: ParseContext): ParserEngine;
  canHandle(source: string | Record<string, any>): boolean;
}

class DomEngineFactory implements EngineFactory {
  readonly type: ParseSourceType = 'dom';

  canHandle(source: string | Record<string, any>): boolean {
    if (typeof source === 'string') {
      return source.trim().startsWith('<') || 
             /<[a-z][\s\S]*>/i.test(source) ||
             /<![DOCTYPE]/i.test(source);
    }
    return false;
  }

  create(source: string | Record<string, any>, context?: ParseContext): ParserEngine {
    if (typeof source === 'string') {
      return new DomParseEngine(source, context);
    }
    throw new Error('DOM engine requires string input');
  }
}

class JsonEngineFactory implements EngineFactory {
  readonly type: ParseSourceType = 'json';

  canHandle(source: string | Record<string, any>): boolean {
    if (typeof source === 'string') {
      try {
        const parsed = JSON.parse(source);
        return typeof parsed === 'object' && parsed !== null;
      } catch {
        return false;
      }
    }
    return typeof source === 'object' && source !== null;
  }

  create(source: string | Record<string, any>, context?: ParseContext): ParserEngine {
    return new JsonParseEngine(source, context);
  }
}

class TextEngineFactory implements EngineFactory {
  readonly type: ParseSourceType = 'text';

  canHandle(source: string | Record<string, any>): boolean {
    if (typeof source === 'string') {
      return source.trim().length > 0 && !this.isHtml(source) && !this.isJson(source);
    }
    return false;
  }

  private isHtml(source: string): boolean {
    const trimmed = source.trim();
    return trimmed.startsWith('<') || /<[a-z][\s\S]*>/i.test(source);
  }

  private isJson(source: string): boolean {
    try {
      JSON.parse(source);
      return true;
    } catch {
      return false;
    }
  }

  create(source: string | Record<string, any>, context?: ParseContext): ParserEngine {
    if (typeof source === 'string') {
      return new DomParseEngine(source, context);
    }
    throw new Error('Text engine requires string input');
  }
}

export class ParseEngineFactory {
  private static instance: ParseEngineFactory;
  private readonly factories: Map<ParseSourceType, EngineFactory> = new Map();
  private readonly defaultFactories: EngineFactory[] = [
    new JsonEngineFactory(),
    new DomEngineFactory(),
    new TextEngineFactory(),
  ];

  private constructor() {
    this.registerFactory('dom', new DomEngineFactory());
    this.registerFactory('json', new JsonEngineFactory());
    this.registerFactory('text', new TextEngineFactory());
  }

  static getInstance(): ParseEngineFactory {
    if (!ParseEngineFactory.instance) {
      ParseEngineFactory.instance = new ParseEngineFactory();
    }
    return ParseEngineFactory.instance;
  }

  registerFactory(type: ParseSourceType, factory: EngineFactory): void {
    this.factories.set(type, factory);
  }

  unregisterFactory(type: ParseSourceType): boolean {
    return this.factories.delete(type);
  }

  getFactory(type: ParseSourceType): EngineFactory | undefined {
    return this.factories.get(type);
  }

  createEngine(source: string | Record<string, any>, context?: ParseContext): ParserEngine {
    for (const factory of this.defaultFactories) {
      if (factory.canHandle(source)) {
        return factory.create(source, context);
      }
    }

    for (const factory of this.factories.values()) {
      if (factory.canHandle(source)) {
        return factory.create(source, context);
      }
    }

    throw new Error('Unable to determine appropriate engine for source');
  }

  createEngineWithType(type: ParseSourceType, source: string | Record<string, any>, context?: ParseContext): ParserEngine {
    const factory = this.factories.get(type);
    if (factory) {
      return factory.create(source, context);
    }
    throw new Error(`No factory registered for type: ${type}`);
  }

  canHandle(source: string | Record<string, any>): ParseSourceType | null {
    for (const factory of this.defaultFactories) {
      if (factory.canHandle(source)) {
        return factory.type;
      }
    }
    return null;
  }

  getRegisteredTypes(): ParseSourceType[] {
    return Array.from(this.factories.keys());
  }
}

export function buildParseEngine(source: string | Record<string, any>, context?: ParseContext): ParserEngine {
  return ParseEngineFactory.getInstance().createEngine(source, context);
}

export function buildParseEngineWithType(type: ParseSourceType, source: string | Record<string, any>, context?: ParseContext): ParserEngine {
  return ParseEngineFactory.getInstance().createEngineWithType(type, source, context);
}

export function getParseEngineFactory(): ParseEngineFactory {
  return ParseEngineFactory.getInstance();
}
