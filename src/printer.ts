import * as isPrimitive from 'is-primitive';
import { LAMBDA, MACRO } from './special';
import { Lambda, Macro } from './types';
import { isEmptyList, isList } from './util';

const toPrimitive = (expression: any): string => {
  if (isEmptyList(expression)) {
    return 'Nil';
  }

  if (isList(expression)) {
    return `(${expression.map(toPrimitive).join(' ')})`;
  }

  if (expression instanceof Lambda) {
    return `(${LAMBDA} ${toPrimitive(expression.args)} ${expression.body.map(toPrimitive).join(' ')})`;
  }

  if (expression instanceof Macro) {
    return `(${MACRO} ${toPrimitive(expression.args)} ${expression.body.map(toPrimitive).join(' ')})`;
  }

  if (isPrimitive(expression)) {
    return expression;
  }

  return `js:${expression}`;
};

export default toPrimitive;
