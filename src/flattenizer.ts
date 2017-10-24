import * as compose from 'compose-function';
import * as _ from 'lodash';
import { APOSTROPHE, CLOSE_PARENTHESIS, INDENT, NEW_LINE, OPEN_PARENTHESIS } from './lexeme';
import tailRecursion from './tailRecursion';
import { arraySplitBy } from './util';

const splitLexemesToLines = (lexemes: any[]): any[][] => {
  return arraySplitBy(lexemes, lexeme => lexeme === NEW_LINE);
};

const mergeLexemeLines = (lexemes: any[][]): any[] => {
  return _.flatten(lexemes);
};

const isEmptyLine = (line: any[]) => line.every(lexeme => lexeme === INDENT);

const ignoreEmptyLines = (linesOfLexemes: any[][]): any[][] => (
  linesOfLexemes.filter(line => !isEmptyLine(line))
);

const shrinkRedundantIndent = (linesOfLexemes: any[][]): any[][] => {
  if (_.isEmpty(linesOfLexemes)) {
    return [];
  }
  const minimalDetectedIndent = _.min(linesOfLexemes.map(line => getLineIndent(line)));
  return linesOfLexemes.map(line => line.slice(minimalDetectedIndent));
};

const convertIndentsToBrackets = (linesOfLexemes: any[][]): any[][] => {
  const iter = tailRecursion(([thisLine, nextLine, ...restLines]: any[][], parenBalance: number = 0, indentsStack: number[] = [], acc: any[][] = []) => {

    if (_.isNil(thisLine)) {
      const parensLeftOpen = _.size(indentsStack);
      const parens = Array(parensLeftOpen).fill(CLOSE_PARENTHESIS);
      return [...acc, parens];
    }

    const balanceAfterLine = parenBalance + getLineBalance(thisLine);
    const thisLineIndent = getLineIndent(thisLine);
    const lineWithoutIndent = thisLine.slice(thisLineIndent);

    const passLineUnchanged = () => iter(
      [nextLine, ...restLines],
      balanceAfterLine,
      indentsStack,
      [...acc, lineWithoutIndent],
    );

    // Do not wrap brackets inside opened brackets
    if (parenBalance !== 0) {
      return passLineUnchanged();
    }

    // Do not wrap brackets if line does not have indent and starts with open parenthesis
    if (_.isEmpty(indentsStack) && isStartsWithList(thisLine)) {
      return passLineUnchanged();
    }

    const thisLineIndentStack = calcNewIndentStack(indentsStack, thisLineIndent);

    // this line is last
    if (_.isNil(nextLine)) {
      if (_.size(lineWithoutIndent) === 1) {
        return iter(
          [nextLine, ...restLines],
          balanceAfterLine,
          thisLineIndentStack,
          [...acc, lineWithoutIndent],
        );
      }

      return iter(
        [],
        balanceAfterLine,
        thisLineIndentStack,
        [...acc, [OPEN_PARENTHESIS, ...lineWithoutIndent, CLOSE_PARENTHESIS]],
      );
    }

    const nextLineIndent = getLineIndent(nextLine);


    if (nextLineIndent > thisLineIndent) {
      return iter(
        [nextLine, ...restLines],
        balanceAfterLine,
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
        [nextLine, ...restLines],
        balanceAfterLine,
        thisLineIndentStack,
        [...acc, wrappedLine],
      );
    }

    const parensToClose = _.size(thisLineIndentStack) - calcNewIndentStack(thisLineIndentStack, nextLineIndent);
    const parens = Array(parensToClose).fill(CLOSE_PARENTHESIS);

    return iter(
      [nextLine, ...restLines],
      balanceAfterLine,
      thisLineIndentStack,
      [...acc, [...wrappedLine, ...parens]],
    );
  });

  return iter(linesOfLexemes)
};

const isStartsWithList = (lexemes: any[]): boolean => (
  _.includes([OPEN_PARENTHESIS, APOSTROPHE], _.head(lexemes))
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

const getLineBalance = (lexemes: any[]) => {
  return lexemes.reduce((acc, lexeme) => {
    if (lexeme === OPEN_PARENTHESIS) {
      return acc + 1;
    }
    if (lexeme === CLOSE_PARENTHESIS) {
      return acc - 1;
    }
    return acc;
  }, 0);
};

const getLineIndent = (lexemes: any[]) => {
  return _.size(_.takeWhile(lexemes, lexeme => lexeme === INDENT));
};

export default compose(
  mergeLexemeLines,
  convertIndentsToBrackets,
  shrinkRedundantIndent,
  ignoreEmptyLines,
  splitLexemesToLines,
);
