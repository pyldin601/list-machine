import { isNil } from 'lodash';
import tailRecursion from './tailRecursion';

export const OPEN_PARENTHESIS = Symbol('(');
export const CLOSE_PARENTHESIS = Symbol(')');
export const APOSTROPHE = Symbol('\'');

export type ILexeme = symbol | string;

export class Indent {
  public size: number;
  constructor(size: number) {
    this.size = size;
  }
}

export default (program: string): ILexeme[] => {
  const baseIterator = tailRecursion(([head, ...tail]: string[], depth: number, accumulator: ILexeme[]): ILexeme[] => {
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
      case '\r':
      case '\t':
        return baseIterator(tail, depth, accumulator);
      case '\n':
        return indentIterator(tail, 0, depth, accumulator);
      case '\'':
        return baseIterator(tail, depth, [...accumulator, APOSTROPHE]);
      default:
        return symbolIterator(tail, head, depth, accumulator);
    }
  });

  const symbolIterator = tailRecursion(([head, ...tail]: string[], symbol: string, depth: number, accumulator: ILexeme[]): ILexeme[] => {
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
  });

  const indentIterator = tailRecursion((list: string[], size: number, depth: number, acc: ILexeme[]): ILexeme[] => {
    const [head, ...tail] = list;
    switch (head) {
      case ' ':
        return indentIterator(tail, size + 1, depth, acc);
      default:
        return baseIterator(
          list,
          depth,
          size > 0
            ? [...acc, new Indent(size)]
            : acc,
        );
    }
  });

  return indentIterator(program.split(''), 0, 0, []);
};
