import * as isPrimitive from 'is-primitive';
import { LAMBDA, MACRO } from './special';
import { Lambda, Macro } from './types';
import { isEmptyList, isList } from './util';
import LMSymbol from "./types/LMSymbol";

const toPrimitive = (expression: any): string => {
  if (isList(expression)) {
    return `(${expression.map(toPrimitive).join(' ')})`;
  }

  if (expression instanceof Lambda) {
    return `(${LAMBDA} ${toPrimitive(expression.args)} ${expression.body.map(toPrimitive).join(' ')})`;
  }

  if (expression instanceof Macro) {
    return `(${MACRO} ${toPrimitive(expression.args)} ${expression.body.map(toPrimitive).join(' ')})`;
  }

  if (expression instanceof LMSymbol) {
    return expression.value;
  }

  if (typeof expression === 'string') {
    return `"${expression.replace('"', '\\""')}"`;
  }

  if (isPrimitive(expression)) {
    return expression;
  }

  return String(expression);
};

export default toPrimitive;
