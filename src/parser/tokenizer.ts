import * as _ from 'lodash';
import Token, { Punctuator, TokenType } from '../types/Token';
import Accumulator from './Accumulator';
import { CharCode, getCharName } from './charCodes';

const SPREST_OPERATOR = '...';

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

const interpretIdentifier = (value: string): Token => {
  if (_.isEmpty(value)) {
    throw new Error('Unexpected empty identifier');
  }
  if (_.head(value) === '/') {
    return new Token(TokenType.REGEXP, value);
  }
  if (_.includes(['true', 'false'], value)) {
    return new Token(TokenType.BOOLEAN, value);
  }
  if (!isNaN(parseFloat(value))) {
    return new Token(TokenType.NUMBER, value);
  }
  if (value === 'undefined') {
    return new Token(TokenType.UNDEFINED, value);
  }
  if (value === 'null') {
    return new Token(TokenType.NULL, value);
  }
  if (value !== SPREST_OPERATOR && value.includes('.')) {
    throw new Error('Incorrect identifier name');
  }
  return new Token(TokenType.ID, value);
};

export default function* tokenizeCharStream(source: IterableIterator<number>): IterableIterator<Token> {
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
          yield interpretIdentifier(value);
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
              yield new Token(TokenType.PUNCTUATOR, getCharName(charCode));
            } else {
              if (!acc.isFilled()) {
                saveStartPos();
              }

              acc.add(charCode);

              if (acc.equals(SPREST_OPERATOR)) {
                yield new Token(TokenType.PUNCTUATOR, Punctuator.SPREST);
                acc.clean();
              }
            }
        }
        break;

      case TokenizerState.STRING:
        switch (charCode) {
          case CharCode.BACKSLASH:
            state = TokenizerState.STRING_ESCAPE;
            break;

          case CharCode.DOUBLE_QUOTE:
            yield new Token(TokenType.STRING, acc.getAndInit());
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
            yield new Token(TokenType.COMMENT, acc.getAndInit());
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

  switch (state) {
    case TokenizerState.BASE:
      if (acc.isFilled()) {
        const value = acc.getAndInit();
        yield interpretIdentifier(value);
      }
      break;

    case TokenizerState.INLINE_COMMENT:
      yield new Token(TokenType.COMMENT, acc.getAndInit());
      break;

    default:
      throw new Error('Unexpected EOF');
  }
}
