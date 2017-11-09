import * as _ from 'lodash';
import { List } from "../../types";
import Env from '../Env';
import evalArguments from '../evalArguments';
import { evalExpr } from '../evaluate';
import { nativeForms } from './';

const binaryOperator = (fn: (a: any, b: any) => any, env: Env) => (args: List<any>) => {
  if (args.length < 2) {
    throw new Error('Binary operator requires at least two arguments');
  }

  const evaluatedArgs = evalArguments(args, env);

  return evaluatedArgs.tail.reduce((acc, arg) => fn(acc, arg), evaluatedArgs.head);
};

const logicalOperator = (fn: (a: any, b: any) => any, env: Env) => (args: List<any>) => {
  if (args.length < 2) {
    throw new Error('Binary operator requires at least two arguments');
  }

  let left = evalExpr(args.head, env);

  return args.tail.every(right => {
    left = fn(left, evalExpr(right, env));
    return left;
  });
};

export default () => {
  nativeForms.set('+', (env: Env) => binaryOperator((a: number, b: number) => a + b, env));
  nativeForms.set('-', (env: Env) => binaryOperator((a: number, b: number) => a - b, env));
  nativeForms.set('*', (env: Env) => binaryOperator((a: number, b: number) => a * b, env));
  nativeForms.set('/', (env: Env) => binaryOperator((a: number, b: number) => a / b, env));
  nativeForms.set('%', (env: Env) => binaryOperator((a: number, b: number) => a % b, env));

  nativeForms.set('eq?', (env: Env) => logicalOperator((a: number, b: number) => a === b, env));
  nativeForms.set('ne?', (env: Env) => logicalOperator((a: number, b: number) => a !== b, env));
  nativeForms.set('gt?', (env: Env) => logicalOperator((a: number, b: number) => a > b, env));
  nativeForms.set('lt?', (env: Env) => logicalOperator((a: number, b: number) => a < b, env));
  nativeForms.set('gte?', (env: Env) => logicalOperator((a: number, b: number) => a >= b, env));
  nativeForms.set('lte?', (env: Env) => logicalOperator((a: number, b: number) => a <= b, env));

  nativeForms.set('and', (env: Env) => logicalOperator((a: any, b: any) => a && b, env));
  nativeForms.set('or', (env: Env) => logicalOperator((a: any, b: any) => a || b, env));
  nativeForms.set('not', (env: Env) => (arg: any) => !evalExpr(arg, env));
};
