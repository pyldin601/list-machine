import * as _ from 'lodash';
import Accumulator from './Accumulator';
import { CharCode, getCharName } from './charCodes';
import { IToken, TokenType } from './types';

const punctuators = new Set([
  CharCode.LEFT_PAREN,
  CharCode.RIGHT_PAREN,
  CharCode.LEFT_BRACKET,
  CharCode.RIGHT_BRACKET,
  CharCode.LINE_FEED,
  CharCode.SPACE,
  CharCode.APOSTROPHE,
  CharCode.TAB,
]);

const isPunctuator = (charCode: number): boolean =>
  punctuators.has(charCode);

const isNotIdentifier = (charCode: number): boolean =>
  charCode === CharCode.DOUBLE_QUOTE ||
  charCode === CharCode.SEMICOLON ||
  isPunctuator(charCode);

enum TokenizerState {
  BASE,
  STRING,
  STRING_ESCAPE,
  INLINE_COMMENT,
}

const interpretIdentifierType = (id: string): TokenType => {
  if (_.isEmpty(id)) {
    throw new Error('Unexpected empty identifier');
  }
  if (_.head(id) === '/') {
    return TokenType.REGEXP;
  }
  if (_.includes(['true', 'false'], id)) {
    return TokenType.BOOLEAN;
  }
  if (!isNaN(parseFloat(id))) {
    return TokenType.NUMBER;
  }
  if (id === 'undefined') {
    return TokenType.UNDEFINED;
  }
  if (id === 'null') {
    return TokenType.NULL;
  }
  return TokenType.ID;
};

export function* tokenize(source: IterableIterator<number>): IterableIterator<IToken> {
  const acc = new Accumulator();

  let state = TokenizerState.BASE;
  let column = 1;
  let line = 1;
  let startPos = { column, line };

  const saveStartPos = () => startPos = { line, column };

  for (const charCode of source) {
    switch (state) {
      case TokenizerState.BASE:
        if (isNotIdentifier(charCode) && acc.isFilled()) {
          const value = acc.getAndInit();
          yield {
            position: startPos,
            type: interpretIdentifierType(value),
            value,
          };
        }

        switch (charCode) {
          case CharCode.DOUBLE_QUOTE:
            saveStartPos();
            state = TokenizerState.STRING;
            break;

          case CharCode.SEMICOLON:
            saveStartPos();
            state = TokenizerState.INLINE_COMMENT;
            break;

          default:
            if (isPunctuator(charCode)) {
              yield {
                position: { line, column },
                type: TokenType.PUNCTUATOR,
                value: getCharName(charCode),
              };
            } else {
              if (!acc.isFilled()) {
                saveStartPos();
              }

              acc.add(charCode);
            }
        }
        break;

      case TokenizerState.STRING:
        switch (charCode) {
          case CharCode.BACKSLASH:
            state = TokenizerState.STRING_ESCAPE;
            break;

          case CharCode.DOUBLE_QUOTE:
            yield {
              position: startPos,
              type: TokenType.STRING,
              value: acc.getAndInit(),
            };
            state = TokenizerState.BASE;
            break;

          default:
            acc.add(charCode);
            break;
        }
        break;

      case TokenizerState.STRING_ESCAPE:
        acc.add(charCode);
        state = TokenizerState.STRING;
        break;

      case TokenizerState.INLINE_COMMENT:
        switch (charCode) {
          case CharCode.LINE_FEED:
            yield {
              position: startPos,
              type: TokenType.COMMENT,
              value: acc.getAndInit(),
            };
            state = TokenizerState.BASE;
            break;

          default:
            acc.add(charCode);
        }
        break;
    }

    if (charCode === CharCode.LINE_FEED) {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  if (acc.isFilled()) {
    const value = acc.getAndInit();
    switch (state) {
      case TokenizerState.BASE:
        yield {
          position: startPos,
          type: interpretIdentifierType(value),
          value,
        };
        break;

      case TokenizerState.INLINE_COMMENT:
        yield {
          position: startPos,
          type: TokenType.COMMENT,
          value,
        };
        break;

      default:
        throw new Error('Unexpected EOF');
    }
  }
}
