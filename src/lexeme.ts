import * as compose from 'compose-function';
import * as _ from 'lodash';
import flattenize from './flattenizer';
import tailRecursion from './tailRecursion';

export const OPEN_PARENTHESIS = Symbol('OPEN_PARENTHESIS');
export const CLOSE_PARENTHESIS = Symbol('CLOSE_PARENTHESIS');
export const APOSTROPHE = Symbol('APOSTROPHE');
export const SPACE = Symbol('SPACE');
export const NEW_LINE = Symbol('NEW_LINE');

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
      case '\r':
      case '\t':
        return baseIterator(tail, depth, accumulator);
      case ' ':
        return baseIterator(tail, depth, [...accumulator, SPACE]);
      case '\n':
        return baseIterator(tail, depth, [...accumulator, NEW_LINE]);
      case '\'':
        return baseIterator(tail, depth, [...accumulator, APOSTROPHE]);
      default:
        return symbolIterator(tail, head, depth, accumulator);
    }
  });

  const symbolIterator = tailRecursion((lexemes: string[], symbol: string, depth: number, accumulator: ILexeme[]): ILexeme[] => {
    const [head, ...tail] = lexemes;

    if (_.isNil(head)) {
      if (depth !== 0) {
        throw new Error(`Syntax error`)
      }
      return [...accumulator, symbol];
    }

    switch (head) {
      case '(':
      case ')':
      case '\r':
      case '\t':
      case ' ':
      case '\n':
        return baseIterator(lexemes, depth, [...accumulator, symbol]);
      default:
        return symbolIterator(tail, symbol + head, depth, accumulator);
    }
  });

  return baseIterator(program.split(''), 0, []);
};

const postProcess = (lexemes: any[]): any[] => {
  const iter = tailRecursion(([head, ...tail]: any[], acc: any[]) => {
    if (_.isNil(head)) {
      return acc;
    }

    switch (head) {
      case NEW_LINE:
      case SPACE:
        return iter(tail, acc);
    }

    return iter(tail, [...acc, head]);
  });

  return iter(lexemes, []);
};

export default compose(postProcess, parse);
