import * as _ from 'lodash';
import Env from './Env';
import { evaluateArgs, expandMacro, combineArguments } from './evalCore';
import getGlobal from './global';
import toList from './list';
import lmCore from './lmcore';
import { callSpecialForm, isSpecialForm, QUOTE } from './special';
import parse from './tokens';
import { Lambda, Macro } from './types';
import { isEmptyList, isList } from './util';

const globalJSObject: { [key: string]: any } = getGlobal();

export const initializeEnv = () => {
  const env = new Env();
  evaluate(lmCore, env);
  return env;
};

const evalLMSymbol = (symbol: any, env: Env): any => {
  const { value } = symbol;
  if (env.isBound(value)) {
    return env.get(value);
  }

  if (isJsCall(value)) {
    return globalJSObject[value.slice(3)];
  }

  return symbol;
};

const evalExpression = (expression: any, env: Env): any => {
  if (isList(expression)) {
    return applyExpression(expression, env);
  }

  return expression;
};

const isMethodCall = (op: any): boolean => {
  return isLMSymbol(op) && (op.value[0] === '.');
};

const isJsCall = (exp: any): boolean => {
  return typeof exp === 'string' && exp.slice(0, 3) === 'js/';
};

const evalAndQuoteNativeList = (list: any, env: Env): any => {
  if (isEmptyList(list)) {
    return list;
  }

  return list.map((item: any) => {
    if (isList(item)) {
      return [new LMSymbol(QUOTE), evalAndQuoteNativeList(item, env)];
    }
    return evalExpression(item, env);
  });
};

const applyExpression = (expression: any, env: Env) => {
  if (isEmptyList(expression)) {
    return expression;
  }

  const [op, ...args] = expression;
  const evaluatedOp = evalExpression(op, env);

  if (isLMSymbol(evaluatedOp) && isSpecialForm(evaluatedOp.value)) {
    return callSpecialForm(evaluatedOp.value, args, evalExpression, env);
  }

  if (evaluatedOp instanceof Macro) {
    const packedArgs = combineArguments(args, evaluatedOp.args);

    return expandMacro(packedArgs, evaluatedOp.body).reduce(
      (previousResult: any, exp: any) => evalExpression(exp, env),
      undefined,
    );
  }

  const evaluatedArgs = evaluateArgs(args, (exp: any) => evalExpression(exp, env));

  if (isMethodCall(evaluatedOp)) {
    return callMethod(
      env,
      evaluatedOp.value.slice(1),
      _.head(evaluatedArgs),
      _.tail(evaluatedArgs),
    );
  }

  if (typeof evaluatedOp === 'function') {
    return evaluatedOp(...evaluatedArgs);
  }

  throw new Error(`Symbol "${evaluatedOp}" is not callable`);
};

// todo: split types to js and non-js
const callMethod = (env: Env, method: string, object: any, args: any[]): any => {
  const patchedArgs = args.map(arg => {
    if (arg instanceof Lambda && !isLMType(object)) {
      return (...innerArgs: any[]) => {
        const evaluatedArguments = evalAndQuoteNativeList(innerArgs, env);
        return applyExpression([arg, ...evaluatedArguments], env);
      };
    }
    return arg;
  });
  return object[method](...patchedArgs);
};

const evaluate = (program: string, env: Env = initializeEnv()): any => {
  const tokens = parse(program);

  const list = toList(tokens);

  return list.reduce(
    (acc: any, sym: any) => evalExpression(sym, env),
    undefined,
  );
};

export default evaluate;
