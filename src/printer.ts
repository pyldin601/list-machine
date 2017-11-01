import * as isPrimitive from 'is-primitive';
import { LAMBDA, MACRO } from './special';
import { Lambda, Macro } from './types';
import LMSymbol from "./types/LMSymbol";
import { isList } from './util';

const print = (expression: any): string => {
  if (isList(expression)) {
    return `(${expression.map(print).join(' ')})`;
  }

  if (expression instanceof Lambda) {
    return `(${LAMBDA} ${print(expression.args)} ${expression.body.map(print).join(' ')})`;
  }

  if (expression instanceof Macro) {
    return `(${MACRO} ${print(expression.args)} ${expression.body.map(print).join(' ')})`;
  }

  if (expression instanceof LMSymbol) {
    return expression.value;
  }

  if (typeof expression === 'string') {
    return `"${expression.replace('"', '\\"')}"`;
  }

  if (isPrimitive(expression)) {
    return expression;
  }

  return String(expression);
};

export default print;
