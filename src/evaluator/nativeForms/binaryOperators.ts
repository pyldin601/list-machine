import * as _ from 'lodash';
import Env from '../../Env';
import evalArguments from '../evalArguments';
import evaluate from '../evaluate';
import { nativeForms } from './';

const binaryOperator = (fn: (a: any, b: any) => any, env: Env) => (...args: any[]) => {
  if (_.size(args) < 2) {
    throw new Error('Binary operator requires at least two arguments');
  }

  const evaluatedArgs = evalArguments(args, env);

  return _.tail(evaluatedArgs).reduce((acc, arg) => fn(acc, arg), _.head(evaluatedArgs));
};

const logicalOperator = (fn: (a: any, b: any) => any, env: Env) => (...args: any[]) => {
  if (_.size(args) < 2) {
    throw new Error('Binary operator requires at least two arguments');
  }

  let left = evaluate(_.head(args), env);

  return _.tail(args).every(right => {
    left = fn(left, evaluate(right, env));
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

  nativeForms.set('and', (env: Env) => logicalOperator((a: number, b: number) => a && b, env));
  nativeForms.set('or', (env: Env) => logicalOperator((a: number, b: number) => a || b, env));
  nativeForms.set('not', (env: Env) => arg => !evaluate(arg, env));
};
