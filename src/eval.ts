import * as _ from 'lodash';
import Env from './Env';
import getGlobal from './global';
import toList from './list';
import { callSpecialForm, isSpecialForm } from './special';
import parse from './tokens';
import { isLMSymbol, isLMType, Lambda, LMSymbol, Macro } from './types';
import { isEmptyList, isList, isSymbol } from './util';

const initialEnv = new Env();

const globalJSObject = getGlobal();

const evalLMSymbol = (symbol: LMSymbol, env: Env): any => {
  const { value } = symbol;
  if (env.isBound(value)) {
    return env.get(value);
  }

  if (isJsCall(value)) {
    return globalJSObject[value.slice(3)];
  }

  return symbol;
};

const evalExpression = (expression: any, env: Env) => {
  if (isList(expression)) {
    return applyExpression(expression, env);
  }

  if (isLMSymbol(expression)) {
    return evalLMSymbol(expression, env);
  }

  return expression;
};

const isMethodCall = (op: any): boolean => {
  return (typeof op === 'string') && (op[0] === '.');
};

const isJsCall = (exp: any): boolean => {
  return typeof exp === 'string' && exp.slice(0, 3) === 'js/';
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
    const zippedArgs = _.zipObject(
      evaluatedOp.args,
      args,
    );
    return expandMacro(zippedArgs, evaluatedOp.body).reduce(
      (previousResult, exp) => evalExpression(exp, env),
      undefined,
    );
  }

  const evaluatedArgs = args.map(arg => evalExpression(arg, env));

  if (isMethodCall(evaluatedOp)) {
    return callMethod(env, evaluatedOp.slice(1), _.first(evaluatedArgs), _.tail(evaluatedArgs));
  }

  if (evaluatedOp instanceof Lambda) {
    const zippedArgs = _.zipObject(
      evaluatedOp.args,
      evaluatedArgs,
    );
    const newEnv = evaluatedOp.env.newEnv(zippedArgs);
    return evaluatedOp.body.reduce(
      (previousResult, exp) => evalExpression(exp, newEnv),
      undefined,
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
      return (...innerArgs) => {
        return evalExpression([arg, ['quote', ...innerArgs]], env);
      };
    }
    return arg;
  });
  return object[method](...patchedArgs);
};

const expandMacro = (args: any, body: any): any => {
  return body.map(exp => {
    if (isList(exp)) {
      return expandMacro(args, exp);
    }
    if (isLMSymbol(exp) && exp.value in args) {
      return args[exp.value];
    }
    return exp;
  });
};

export default (program: string, env: Env = initialEnv): any => {
  const tokens = parse(program);

  const list = toList(tokens);

  return list.reduce(
    (acc, sym) => evalExpression(sym, env),
    undefined,
  );
};
