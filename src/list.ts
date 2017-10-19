import { isNil } from 'lodash';
import { CLOSE_PARENTHESIS, ILexeme, OPEN_PARENTHESIS } from './lexeme';
import tailRecursion from './tailRecursion';

const findClosingParenthesisOffset = (lexemes: ILexeme[]): number => {
  const iter = tailRecursion((offset: number, depth: number): number => {
    if (isNil(lexemes[offset])) {
      throw new Error('Unpaired closing parenthesis');
    }
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
    if (isNil(lexemes[offset])) {
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

export default parseList;
