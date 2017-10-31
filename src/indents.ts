import * as compose from 'compose-function';
import * as _ from 'lodash';
import optimizeTailCall from './optimizeTailCall';
import { APOSTROPHE, CLOSE_PARENTHESIS, INDENT, NEW_LINE, OPEN_PARENTHESIS } from './tokens';
import { arraySplitBy } from './util';

type IToken = string | symbol;

const splitTokensByLines = (tokens: IToken[]): IToken[][] => {
  return arraySplitBy(tokens, token => token === NEW_LINE);
};

const mergeLinesOfTokens = (tokens: IToken[][]): IToken[] => {
  return _.flatten(tokens);
};

const isEmptyLine = (line: IToken[]) => (
  line.every(token => token === INDENT)
);

const rejectEmptyLines = (lines: IToken[][]): IToken[][] => (
  lines.filter(line => !isEmptyLine(line))
);

const shrinkRedundantIndent = (lines: IToken[][]): IToken[][] => {
  if (_.isEmpty(lines)) {
    return [];
  }
  const minimalDetectedIndent = _.min(
    lines.map(line => getLineIndent(line))
  );
  return lines.map(line => line.slice(minimalDetectedIndent));
};

const convertIndentsToBrackets = (lines: IToken[][]): IToken[][] => {
  const iter: any = optimizeTailCall((
    [thisLine, nextLine, ...restLines]: IToken[][],
    indentStack: number[] = [],
    acc: IToken[][] = [],
  ) => {

    if (_.isNil(thisLine)) {
      return acc;
    }

    const thisLineIndent = getLineIndent(thisLine);
    const thisLineIndentStack = calcNewIndentStack(indentStack, thisLineIndent);

    const nextLineIndent = _.isNil(nextLine) ? 0 : getLineIndent(nextLine);
    const nextRestLines = _.isNil(nextLine) ? [] : [nextLine, ...restLines];

    const lineWithoutIndent = thisLine.slice(thisLineIndent);

    if (_.isEmpty(indentStack) && isStartsWithList(thisLine)) {
      return iter(
        nextRestLines,
        indentStack,
        [...acc, lineWithoutIndent],
      );
    }


    if (nextLineIndent > thisLineIndent) {
      return iter(
        nextRestLines,
        thisLineIndentStack,
        [...acc, [OPEN_PARENTHESIS, ...lineWithoutIndent]],
      );
    }

    const wrappedLine = (
      (_.size(lineWithoutIndent) === 1)
        ? lineWithoutIndent
        : [OPEN_PARENTHESIS, ...lineWithoutIndent, CLOSE_PARENTHESIS]
    );

    if (nextLineIndent === thisLineIndent) {
      return iter(
        nextRestLines,
        thisLineIndentStack,
        [...acc, wrappedLine],
      );
    }

    const nextLineIndentStack = calcNewIndentStack(thisLineIndentStack, nextLineIndent);
    const parensToClose = _.size(thisLineIndentStack) - _.size(nextLineIndentStack);
    const parens = Array(parensToClose).fill(CLOSE_PARENTHESIS);

    return iter(
      nextRestLines,
      thisLineIndentStack,
      [...acc, [...wrappedLine, ...parens]],
    );
  });

  return iter(lines)
};

const isStartsWithList = (tokens: IToken[]): boolean => (
  _.includes([OPEN_PARENTHESIS, APOSTROPHE], _.head(tokens))
);

const calcNewIndentStack = (indentsStack: number[], newIndent: number): number[] => {
  const size = _.sum(indentsStack);

  if (newIndent === size) {
    return indentsStack;
  }

  if (newIndent > size) {
    return [...indentsStack, newIndent - size];
  }

  return deleteIndentsByDifference(indentsStack, size - newIndent);
};

const deleteIndentsByDifference = (indentsStack: number[], indentDifference: number): number[] => {
  if (indentDifference === 0) {
    return indentsStack;
  }

  const lastIndent = _.last(indentsStack);
  const initialIndents = _.initial(indentsStack);

  if (lastIndent > indentDifference) {
    return initialIndents;
  }

  return deleteIndentsByDifference(initialIndents, indentDifference - lastIndent);
};

const getLineIndent = (tokens: IToken[]) => {
  return _.size(_.takeWhile(tokens, token => token === INDENT));
};

export default compose(
  mergeLinesOfTokens,
  convertIndentsToBrackets,
  shrinkRedundantIndent,
  rejectEmptyLines,
  splitTokensByLines,
);
