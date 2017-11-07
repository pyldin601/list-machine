import * as isPrimitive from 'is-primitive';
import { LAMBDA, MACRO, QUOTE } from './special';
import { ASTERISK } from './tokens';
import { Lambda, Macro } from './types';
import LMSymbol from './types/LMSymbol';
import { isList } from './util';
import Cons from "./types/Cons";

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

  if (expression instanceof Cons) {
    return `(${print(expression.car)} ${print(expression.cdr)})`;
  }

  if (typeof expression === 'string') {
    return `"${expression.replace('"', '\\"')}"`;
  }

  if (typeof expression === 'symbol') {
    return expression.toString();
  }

  if (expression === ASTERISK) {
    return '*';
  }

  if (expression === QUOTE) {
    return '\'';
  }

  if (isPrimitive(expression)) {
    return expression;
  }

  return String(expression);
};

export default print;
