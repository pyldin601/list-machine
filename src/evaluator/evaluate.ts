import { Identifier, Lambda, List, Macro } from '../types';
import Env from './Env';
import { getNativeForm, isNativeForm } from './nativeForms';
import valueOf from './valueOf';

const evaluate = (expr: List<any>, env: Env): any => {
  return evalEach(expr, env);
};

const evalEach = (exprs: List<any>, env: Env): any => {
  return exprs.reduce((acc, expr) => evalExpr(expr, env), undefined);
};

export const evalExpr = (expr: any, env: Env): any => {
  if (expr instanceof Identifier) {
    return evalIdentifier(expr, env);
  }

  if (expr instanceof List) {
    return evalList(expr, env);
  }

  if (Array.isArray(expr)) {
    return evalVector(expr, env);
  }

  return expr;
};

const evalIdentifier = (id: Identifier, env: Env): any => {
  if (env.isBound(id.name)) {
    return env.get(id.name);
  }
  if (isNativeForm(id.name)) {
    return getNativeForm(id.name)(env);
  }
  throw new Error(`Unable to resolve symbol "${id.name}" in current context`);
};

const evalList = (list: List<any>, env: Env) => {
  const listOperator = evalExpr(list.head, env);
  const args = list.tail;

  if (listOperator instanceof Macro) {
    console.log(valueOf(listOperator.expand(args)));
    return listOperator.evaluate(args, env);
  }

  if (listOperator instanceof Lambda) {
    return listOperator.evaluate(args, env);
  }

  if (typeof listOperator !== 'function') {
    throw new Error(`Expression ${valueOf(list)} is not callable`);
  }

  return listOperator(args);
};

const evalVector = (vector: any[], env: Env): any => {
  return vector.map(expr => evalExpr(expr, env));
};

export default evaluate;
