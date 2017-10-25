import * as compose from 'compose-function';
import * as _ from 'lodash';
import { QUOTE } from './special';
import optimizeTailCall from './optimizeTailCall';
import { APOSTROPHE, CLOSE_PARENTHESIS, IToken, OPEN_PARENTHESIS } from './tokens';
import { isList } from './util';

type IList = IToken | IToken[];

const findClosingParenthesisOffset = (tokens: IToken[]): number => {
  const iter = optimizeTailCall((offset: number, depth: number): number => {
    const head = tokens[offset];
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

const parseList = (tokens: IToken[]): any[] => {
  const iter = optimizeTailCall((offset: number, accumulator: IList[]): IList[] => {
    if (_.isNil(tokens[offset])) {
      return accumulator;
    }
    const head = tokens[offset];
    const tail = tokens.slice(offset + 1);
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

const postProcess = (list: IList[]): IList[] => {
  const iter = optimizeTailCall(([head, ...tail], acc: IList[]): IList[] => {
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
