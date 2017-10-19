import * as isPrimitive from 'is-primitive';
import { LAMBDA } from './special';
import { Lambda } from './types';

const toPrimitive = (expression: any): string => {
  if (Array.isArray(expression)) {
    return `(${expression.map(toPrimitive).join(' ')})`;
  }

  if (expression instanceof Lambda) {
    return `(${LAMBDA} ${toPrimitive(expression.args)} ${expression.body.map(toPrimitive).join(' ')})`;
  }

  if (isPrimitive(expression)) {
    return expression;
  }

  return JSON.stringify(expression);
};

export default toPrimitive;
