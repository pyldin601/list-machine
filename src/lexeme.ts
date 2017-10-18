import { isNil } from 'lodash';

export const OPEN_PARENTHESIS = Symbol('(');
export const CLOSE_PARENTHESIS = Symbol(')');

export type ILexeme = symbol | string;

export default (program: string): ILexeme[] => {
  const baseIterator = ([head, ...tail]: string[], depth: number, accumulator: ILexeme[]): ILexeme[] => {
    if (isNil(head)) {
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
      case '\n':
      case '\r':
      case '\t':
        return baseIterator(tail, depth, accumulator);
      default:
        return symbolIterator(tail, head, depth, accumulator);
    }
  };

  const symbolIterator = ([head, ...tail]: string[], symbol: string, depth: number, accumulator: ILexeme[]): ILexeme[] => {
    if (isNil(head)) {
      if (depth !== 0) {
        throw new Error(`Unbalanced parenthesis`)
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
  };

  return baseIterator(program.split(''), 0, []);
};
