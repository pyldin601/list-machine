import * as _ from 'lodash';
import { APOSTROPHE, CLOSE_PARENTHESIS, default as lexeme, NEW_LINE, OPEN_PARENTHESIS, SPACE } from './lexeme';
import tailRecursion from './tailRecursion';
import { arraySplitBy } from './util';

const flattenize = (lexemes: any[]): any[] => {
  const lines = arraySplitBy(lexemes, lexeme => lexeme === NEW_LINE);

  if (_.size(lines) === 0) {
    return [];
  }

  const initialIndent = getLineIndent(_.head(lines));

  const iter = tailRecursion(([head, ...tail]: any[][], balance: number, previousLineIndentStack: number[], acc: any[]) => {
    if (_.isNil(head)) {
      const parenthesisList = Array(_.size(previousLineIndentStack)).fill(CLOSE_PARENTHESIS);
      return [...acc, ...parenthesisList];
    }

    const nextLine = _.head(tail);

    const isEmptyLine = head.every(lexeme => lexeme === SPACE);

    if (isEmptyLine) {
      return iter(tail, balance, previousLineIndentStack, acc);
    }

    const newLineBalance = balance + getLineBalance(head);

    if (balance !== 0) {
      return iter(tail, newLineBalance, previousLineIndentStack, [...acc, ...head]);
    }

    const thisLineIndent = getLineIndent(head);
    const lineWithoutIndent = head.slice(thisLineIndent);

    const nextLineHasSameIndent = _.isNil(nextLine) || getLineIndent(nextLine) === thisLineIndent;
    const thisLineContainsSingleItem = _.size(head) === 1;
    const lineStartsWithList = isStartsWithList(lineWithoutIndent);
    const lineNotUnderIndent = _.isEmpty(previousLineIndentStack);

    if ((lineStartsWithList || (thisLineContainsSingleItem && nextLineHasSameIndent)) && lineNotUnderIndent) {
      return iter(tail, newLineBalance, previousLineIndentStack, [...acc, ...head]);
    }

    const nextLineIndent = getLineIndent(nextLine);


    const thisLineIndentStack = calcNewIndentStack(previousLineIndentStack, thisLineIndent - initialIndent);

    if (_.isNil(nextLine)) {
      return iter(tail, newLineBalance, thisLineIndentStack, [
        ...acc,
        OPEN_PARENTHESIS,
        ...lineWithoutIndent,
        CLOSE_PARENTHESIS,
      ]);
    }

    const nextLineIndentStack = calcNewIndentStack(previousLineIndentStack, nextLineIndent - initialIndent);

    if (_.size(nextLineIndentStack) > _.size(thisLineIndentStack)) {
      return iter(
        tail,
        newLineBalance,
        thisLineIndentStack,
        [...acc, OPEN_PARENTHESIS, ...lineWithoutIndent],
      );
    }

    if (_.size(nextLineIndentStack) === _.size(thisLineIndentStack)) {
      return iter(
        tail,
        newLineBalance,
        thisLineIndentStack,
        [...acc, OPEN_PARENTHESIS, ...lineWithoutIndent, CLOSE_PARENTHESIS],
      );
    }

    const indentStackDifference = _.size(thisLineIndentStack) - _.size(nextLineIndentStack);
    const parenthesisToClose = Array(indentStackDifference).fill(CLOSE_PARENTHESIS);

    return iter(
      tail,
      newLineBalance,
      thisLineIndentStack,
      [...acc, OPEN_PARENTHESIS, ...lineWithoutIndent, ...parenthesisToClose],
    );
  });

  return iter(lines, 0, [], []);
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
  return _.size(_.takeWhile(lexemes, lexeme => lexeme === SPACE));
};

export default flattenize;
