import * as compose from 'compose-function';
import * as _ from 'lodash';
import tailRecursion from './tailRecursion';

export const OPEN_PARENTHESIS = Symbol('(');
export const CLOSE_PARENTHESIS = Symbol(')');
export const APOSTROPHE = Symbol('\'');
export const SPACE = Symbol(' ');

export type ILexeme = symbol | string;

const parse = (program: string): ILexeme[] => {
  const baseIterator = tailRecursion(([head, ...tail]: string[], depth: number, accumulator: ILexeme[]): ILexeme[] => {
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
      case ' ':
        return baseIterator(tail, depth, accumulator);
      case '\r':
      case '\t':
      case '\n':
        return baseIterator(tail, depth, accumulator);
      case '\'':
        return baseIterator(tail, depth, [...accumulator, APOSTROPHE]);
      default:
        return symbolIterator(tail, head, depth, accumulator);
    }
  });

  const symbolIterator = tailRecursion(([head, ...tail]: string[], symbol: string, depth: number, accumulator: ILexeme[]): ILexeme[] => {
    if (_.isNil(head)) {
      if (depth !== 0) {
        throw new Error(`Syntax error`)
      }
      return [...accumulator, symbol];
    }

    switch (head) {
      case ')':
        return baseIterator(tail, depth - 1, [...accumulator, symbol, CLOSE_PARENTHESIS]);
      case ' ':
      case '\n':
      case '\r':
      case '\t':
        return baseIterator(tail, depth, [...accumulator, symbol]);
      default:
        return symbolIterator(tail, symbol + head, depth, accumulator);
    }
  });

  return baseIterator(program.split(''), 0, []);
};

export default compose(parse);
