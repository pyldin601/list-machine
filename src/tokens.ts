import * as compose from 'compose-function';
import * as _ from 'lodash';
import flattenize from './indents';
import optimizeTailCall from './optimizeTailCall';
import { LMSymbol } from './types';

export const OPEN_PARENTHESIS   = Symbol('OPEN_PARENTHESIS');
export const CLOSE_PARENTHESIS  = Symbol('CLOSE_PARENTHESIS');
export const APOSTROPHE         = Symbol('APOSTROPHE');
export const INDENT             = Symbol('INDENT');
export const NEW_LINE           = Symbol('NEW_LINE');
export const PLACEHOLDER        = Symbol('PLACEHOLDER');

export type IToken = symbol | string | LMSymbol;

const looksLikeBoolean = (exp: string): boolean => (
  _.includes(['true', 'false'], exp)
);

const looksLikeNumber = (exp: string): boolean => (
  !isNaN(parseFloat(exp))
);

const interpretValue = (value: string): any => {
  if (value === '_') {
    return PLACEHOLDER;
  }
  if (looksLikeBoolean(value)) {
    return value === 'true';
  }
  if (looksLikeNumber(value)) {
    return parseFloat(value);
  }
  return new LMSymbol(value);
};

const parse = (program: string[]): IToken[] => {
  const baseIterator = optimizeTailCall((
    [head, ...tail]: string[],
    depth: number,
    accumulator: IToken[]
  ): IToken[] => {
    if (_.isNil(head)) {
      if (depth !== 0) {
        throw new Error(`Unbalanced parenthesis`)
      }
      return accumulator;
    }

    switch (head) {
      case '(':
        return baseIterator(tail, depth + 1, [...accumulator, OPEN_PARENTHESIS]);
      case ')':
        return baseIterator(tail, depth - 1, [...accumulator, CLOSE_PARENTHESIS]);
      case '\r':
      case '\t':
      case ' ':
        return baseIterator(tail, depth, accumulator);
      case '\n':
        if (depth === 0) {
          return indentIterator(tail, depth, [...accumulator, NEW_LINE])
        } else {
          return baseIterator(tail, depth, accumulator);
        }
      case '\'':
        return baseIterator(tail, depth, [...accumulator, APOSTROPHE]);
      case '"':
        return stringIterator(tail, '', depth, accumulator);
      default:
        return symbolIterator(tail, head, depth, accumulator);
    }
  });

  const symbolIterator = optimizeTailCall((
    tokens: string[],
    symbol: string,
    depth: number,
    accumulator: IToken[]
  ): IToken[] => {
    const [head, ...tail] = tokens;

    if (_.isNil(head)) {
      if (depth !== 0) {
        throw new Error(`Unexpected symbol literal`)
      }
      return [...accumulator, interpretValue(symbol)];
    }

    switch (head) {
      case '(':
      case ')':
      case '\r':
      case '\t':
      case ' ':
      case '\n':
        return baseIterator(tokens, depth, [...accumulator, interpretValue(symbol)]);
      default:
        return symbolIterator(tail, `${symbol}${head}`, depth, accumulator);
    }
  });

  const stringIterator = optimizeTailCall((
    tokens: string[],
    symbol: string,
    depth: number,
    accumulator: IToken[]
  ): IToken[] => {
    const [head, ...tail] = tokens;

    if (_.isNil(head)) {
      throw new Error(`Unterminated string literal`);
    }

    switch (head) {
      case '"':
        return baseIterator(tail, depth, [...accumulator, symbol]);
      case '\\':
        return escapeIterator(tail, symbol, depth, accumulator);
      default:
        return stringIterator(tail, `${symbol}${head}`, depth, accumulator);
    }
  });

  const escapeIterator = optimizeTailCall((
    tokens: string[],
    str: string,
    depth: number,
    accumulator: IToken[]
  ): IToken[] => {
    const [head, ...tail] = tokens;

    if (_.isNil(head)) {
      throw new Error(`Unterminated escape literal`);
    }

    return stringIterator(tail, `${str}${head}`, depth, accumulator);
  });

  const indentIterator = optimizeTailCall((tokens: string[], depth: number, acc: IToken[]): IToken[] => {
    const [head, ...tail] = tokens;

    if (_.isNil(head)) {
      return acc;
    }

    switch (head) {
      case ' ':
        return indentIterator(tail, depth, [...acc, INDENT]);
      default:
        return baseIterator(tokens, depth, acc);
    }
  });

  return indentIterator(program, 0, []);
};

const splitChars = (chars: string) => chars.split('');
//
// const toListInternal = (tokens: IToken[], depth = 0): any => {
//   const iterateList = optimizeTailCall(([head, ...tail]: IToken[], acc) => {
//     if (_.isNil(head)) {
//       if (depth > 0) {
//         throw new Error(`${depth} non-closed parenthesis found`);
//       }
//       return { acc, tail: [] };
//     }
//     if (head === OPEN_PARENTHESIS) {
//       const parseResult = toListInternal(tail, depth + 1);
//       return iterateList(parseResult.tail, [...acc, parseResult.acc]);
//     }
//     if (head === CLOSE_PARENTHESIS) {
//       if (depth === 0) {
//         const tailCloseCount = _.size(_.find(tail, tok => tok === CLOSE_PARENTHESIS));
//         throw new Error(`${tailCloseCount + 1} superfluous close parenthesis found`);
//       }
//       return { acc, tail };
//     }
//     return iterateList(tail, [...acc, head]);
//   });
//   return iterateList(tokens, []);
// };
//
// const toList = (tokens: IToken[]): any[] => {
//   return toListInternal(tokens, 0).acc;
// };

export default compose(flattenize, parse, splitChars);
