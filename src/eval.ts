import * as _ from 'lodash';
import Env from './Env';
import toList from './list';
import { callSpecialForm, isSpecialForm } from './special';
import parse from './tokens';
import { Lambda, Macro } from './types';
import { isEmptyList, isList, isSymbol } from './util';

const initialEnv = new Env();

const evalExpression = (expression: any, env: Env) => {
  if (isList(expression)) {
    return applyExpression(expression, env);
  }

  if (env.isBound(expression)) {
    return env.get(expression);
  }

  if (looksLikeBoolean(expression)) {
    return expression === 'true';
  }

  if (looksLikeNumber(expression)) {
    return parseFloat(expression);
  }

  return expression;
};

const isMethodCall = (op: string): boolean => {
  return op[0] === '.';
};

const isNewCall = (op: string): boolean => {
  return op === '.new';
};

const applyExpression = (expression: any, env: Env) => {
  if (isEmptyList(expression)) {
    return expression;
  }

  const [op, ...args] = expression;
  const evaluatedOp = evalExpression(op, env);

  if (isSpecialForm(evaluatedOp)) {
    return callSpecialForm(evaluatedOp, args, evalExpression, env);
  }

  if (evaluatedOp instanceof Macro) {
    const zippedArgs = _.zipObject(
      evaluatedOp.args,
      squeezeArguments(
        args,
        evaluatedOp.args.length,
      ),
    );
    return expandMacro(zippedArgs, evaluatedOp.body).reduce(
      (previousResult, exp) => evalExpression(exp, env),
      undefined,
    );
  }

  const evaluatedArgs = args.map(arg => evalExpression(arg, env));

  if (isNewCall(evaluatedOp)) {
    return newInstance(_.first(evaluatedArgs), _.tail(evaluatedArgs));
  }

  if (isMethodCall(evaluatedOp)) {
    return callMethod(evaluatedOp.slice(1), _.first(evaluatedArgs), _.tail(evaluatedArgs));
  }

  if (evaluatedOp instanceof Lambda) {
    const zippedArgs = _.zipObject(
      evaluatedOp.args,
      squeezeArguments(
        evaluatedArgs,
        evaluatedOp.args.length,
      ),
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

const callMethod = (method: string, object: any, args: any[]): any => {
  return object[method](...args);
};

const newInstance = (object: any, args: any[]): any => {
  return new object(...args);
};

const squeezeArguments = (args: any[], amount: number): any[] => {
  if (args.length <= amount) {
    return args;
  }
  return [...args.slice(0, amount - 1), args.slice(amount - 1)];
};

const expandMacro = (args: any, body: any): any => {
  return body.map(exp => {
    if (isList(exp)) {
      return expandMacro(args, exp);
    }
    if (isSymbol(exp) && exp in args) {
      return args[exp];
    }
    return exp;
  });
};

const looksLikeBoolean = (exp: string): boolean => (
  _.includes(['true', 'false'], exp)
);

const looksLikeNumber = (exp: string): boolean => (
  !isNaN(parseFloat(exp))
);

export default (program: string, env: Env = initialEnv): any => {
  const tokens = parse(program);

  const list = toList(tokens);

  return list.reduce(
    (acc, sym) => evalExpression(sym, env),
    undefined,
  );
};
