import type {AxiosRequestConfig} from "axios";
import {UrlParser} from "./url";
import type { ParserEngine, ParseContext, ParseNode, ParseStrategy, ContentExtractor, ParseSourceType } from './ParserEngine/types';
import { AbstractParseEngine } from './ParserEngine/abstract';
import { DomParseEngine, buildDomEngine } from './ParserEngine/DomParseEngine';
import { JsonParseEngine, buildJsonEngine } from './ParserEngine/JsonParseEngine';
import { DomParseNode } from './ParserEngine/dom-node';
import { JsonParseNode } from './ParserEngine/json-node';
import { DefaultParseContext, ChainedParseContext, getGlobalContext, setGlobalContext } from './ParserEngine/context';
import { buildParseEngine, buildParseEngineWithType, getParseEngineFactory, ParseEngineFactory } from './ParserEngine/factory';

export async function parseUrl(url: string): Promise<AxiosRequestConfig> {
  return UrlParser(url);
}

export type {
  ParserEngine,
  ParseContext,
  ParseNode,
  ParseStrategy,
  ContentExtractor,
  ParseSourceType,
};

export {
  AbstractParseEngine,
  DomParseEngine,
  buildDomEngine,
  JsonParseEngine,
  buildJsonEngine,
  DomParseNode,
  JsonParseNode,
  DefaultParseContext,
  ChainedParseContext,
  getGlobalContext,
  setGlobalContext,
  buildParseEngine,
  buildParseEngineWithType,
  getParseEngineFactory,
  ParseEngineFactory,
};

export function createParser(source: string | Record<string, any>, context?: ParseContext): ParserEngine {
  return buildParseEngine(source, context);
}

export function createDomParser(html: string | Element | Element[], context?: ParseContext): DomParseEngine {
  return new DomParseEngine(html, context);
}

export function createJsonParser(json: string | Record<string, any> | Array<any>, context?: ParseContext): JsonParseEngine {
  return new JsonParseEngine(json, context);
}
