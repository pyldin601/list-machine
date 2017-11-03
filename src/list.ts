import * as compose from 'compose-function';
import * as _ from 'lodash';
import optimizeTailCall from './optimizeTailCall';
import { QUOTE, SPREST } from './special';
import { APOSTROPHE, ASTERISK, CLOSE_PARENTHESIS, IToken, OPEN_PARENTHESIS, PLACEHOLDER } from './tokens';
import { LMSymbol } from './types';
import { isList } from './util';

type IList = IToken | IToken[];

const findClosingParenthesisOffset = (tokens: IToken[]): number => {
  const iter = optimizeTailCall((offset: number, depth: number): number => {
    const head = tokens[offset];

    if (_.isNil(head)) {
      throw new Error('Open parenthesis has no pair');
    }

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
      case CLOSE_PARENTHESIS:
        throw new Error('Close parenthesis has no pair');
      default:
        return iter(offset + 1, [...accumulator, head]);
    }
  });

  return iter(0, []);
};

const postProcess = (list: IList[]): IList[] => {
  const iter = optimizeTailCall(([head, ...tail]: IList[], acc: IList[]): IList[] => {
    if (_.isNil(head)) {
      return acc;
    }

    if (isList(head)) {
      return iter(tail, [...acc, postProcess(head as IList[])]);
    }

    if (head === APOSTROPHE) {
      const headOfTail = _.head(tail);
      const quotedNode = isList(headOfTail) ? postProcess(headOfTail as IList[]) : headOfTail;
      return iter(_.tail(tail), [...acc, [new LMSymbol(QUOTE), quotedNode]]);
    }

    if (head === ASTERISK) {
      const headOfTail = _.head(tail);
      const quotedNode = isList(headOfTail) ? postProcess(headOfTail as IList[]) : headOfTail;
      return iter(_.tail(tail), [...acc, [new LMSymbol(SPREST), quotedNode]]);
    }

    return iter(tail, [...acc, head]);
  });

  return iter(list, []);
};

export default compose(postProcess, parseList);
