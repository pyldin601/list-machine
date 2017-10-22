import * as compose from 'compose-function';
import * as _ from 'lodash';
import { APOSTROPHE, CLOSE_PARENTHESIS, ILexeme, OPEN_PARENTHESIS } from './lexeme';
import { QUOTE } from './special';
import tailRecursion from './tailRecursion';
import { isList } from './util';

const findClosingParenthesisOffset = (lexemes: ILexeme[]): number => {
  const iter = tailRecursion((offset: number, depth: number): number => {
    const head = lexemes[offset];
    switch (head) {
      case OPEN_PARENTHESIS:
        return iter(offset + 1, depth + 1);
      case CLOSE_PARENTHESIS:
        if (depth === 0) {
          return offset;
        }
        return iter(offset + 1, depth - 1);
      default:
        return iter(offset + 1, depth);
    }
  });

  return iter(0, 0);
};

const parseList = (lexemes: ILexeme[]): any[] => {
  const iter = tailRecursion((offset: number, accumulator: any[]): any[] => {
    if (_.isNil(lexemes[offset])) {
      return accumulator;
    }
    const head = lexemes[offset];
    const tail = lexemes.slice(offset + 1);
    switch (head) {
      case OPEN_PARENTHESIS:
        const pairOffset = findClosingParenthesisOffset(tail);
        const listContent = parseList(tail.slice(0, pairOffset));
        return iter(offset + pairOffset + 2, [...accumulator, listContent]);
      default:
        return iter(offset + 1, [...accumulator, head]);
    }
  });

  return iter(0, []);
};

const postProcess = (list: any[]): any[] => {
  const iter = tailRecursion(([head, ...tail], acc): any[] => {
    if (_.isNil(head)) {
      return acc;
    }

    if (isList(head)) {
      return iter(tail, [...acc, postProcess(head)]);
    }

    if (head === APOSTROPHE) {
      return iter(_.tail(tail), [...acc, [QUOTE, _.head(tail)]]);
    }

    return iter(tail, [...acc, head]);
  });

  return iter(list, []);
};

export default compose(postProcess, parseList);
