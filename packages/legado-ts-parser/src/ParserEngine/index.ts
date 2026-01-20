import {DomParseEngine} from "./DomParseEngine";
import type {ParserEngine} from "./types";

export function buildParseEngin(str: string): ParserEngine {
  return new DomParseEngine(str);
}