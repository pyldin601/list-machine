import * as compose from 'compose-function';
import * as _ from 'lodash';
import Token, { Punctuator, TokenType } from './Token';
import { arraySplitBy } from '../util';
import IndentStack from './IndentStack';

const splitTokensByOuterLineFeeds = (tokens: Token[]): Token[][] => {
  let depth = 0;

  return arraySplitBy(
    tokens,
    (token) => {
      switch (token.type) {
        case TokenType.PUNCTUATOR:
          switch (token.value) {
            case Punctuator.LEFT_PAREN:
            case Punctuator.LEFT_BRACKET:
              depth += 1;
              break;

            case Punctuator.RIGHT_PAREN:
            case Punctuator.RIGHT_BRACKET:
              depth -= 1;
              break;
          }
          break
      }

      return depth === 0 &&
        token.type === TokenType.PUNCTUATOR &&
        token.value === Punctuator.LINE_FEED;
    },
  );
};

const isIndent = (token: Token) => token.type === TokenType.PUNCTUATOR &&
  (token.value === Punctuator.SPACE || token.value === Punctuator.TAB);

const isEmptyLine = (line: Token[]) => line.every(isIndent);

const getLineIndent = (line: Token[]) => _.size(_.takeWhile(line, isIndent));

const rejectEmptyLines = (lines: Token[][]): Token[][] => (
  lines.filter(line => !isEmptyLine(line))
);

const startsWithListExpression = (line: Token[]): boolean => {
  const headToken = _.head(line);

  return headToken.type === TokenType.PUNCTUATOR &&
    (headToken.value === Punctuator.LEFT_PAREN || headToken.value === Punctuator.APOSTROPHE);
};

const shrinkRedundantIndent = (lines: Token[][]): Token[][] => {
  if (_.isEmpty(lines)) {
    return [];
  }
  const minimalDetectedIndent = _.min(
    lines.map(line => getLineIndent(line))
  );
  return lines.map(line => line.slice(minimalDetectedIndent));
};

const createLeftParenToken = (): Token => {
  return {
    type: TokenType.PUNCTUATOR,
    value: Punctuator.LEFT_PAREN,
  };
};

const createRightParenToken = (): Token => {
  return {
    type: TokenType.PUNCTUATOR,
    value: Punctuator.RIGHT_PAREN,
  };
};

function* generateTimes(times: number, obj: any): IterableIterator<any> {
  for (let j = 0; j < times; j++) {
    yield obj;
  }
}

function* proceedIndents(lines: Token[][]): IterableIterator<Token> {
  if (_.isEmpty(lines)) {
    return;
  }

  const indentStack = new IndentStack();

  for (let i = 0; i < lines.length; i++) {
    const thisLine = lines[i];
    const nextLine = lines[i + 1];

    const thisLineIndent = getLineIndent(thisLine);
    const thisLineIndentStackSize = indentStack.proceed(thisLineIndent).size();

    const nextLineIndent = _.isNil(nextLine) ? 0 : getLineIndent(lines[i]);
    const nextLineIndentStackSize = indentStack.proceed(nextLineIndent).size();

    const thisLineWithoutIndent = thisLine.slice(thisLineIndent);

    if (startsWithListExpression(thisLineWithoutIndent)) {
      yield* thisLineWithoutIndent;
      yield* generateTimes(thisLineIndentStackSize - nextLineIndentStackSize, createRightParenToken());
      continue;
    }

    if (nextLineIndentStackSize > thisLineIndentStackSize) {
      yield createLeftParenToken();
      yield* thisLineWithoutIndent;
      continue;
    }

    const wrappedLine = _.size(thisLineWithoutIndent) === 1
      ? thisLineWithoutIndent
      : [
        createLeftParenToken(),
        ...thisLineWithoutIndent,
        createRightParenToken(),
      ];


    if (nextLineIndentStackSize === thisLineIndentStackSize) {
      yield* wrappedLine;
      continue;
    }

    yield* wrappedLine;
    yield* generateTimes(thisLineIndentStackSize - nextLineIndentStackSize, createRightParenToken());
  }
}

export default compose(
  proceedIndents,
  shrinkRedundantIndent,
  rejectEmptyLines,
  splitTokensByOuterLineFeeds,
  _.toArray,
);
