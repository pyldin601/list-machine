import * as _ from 'lodash';
import Env from './Env';
import parseLexemes from './lexeme';
import parseLists from './list';
import { callSpecialForm, isSpecialForm } from './special';
import { Lambda, Macro } from './types';
import { isEmptyList, isList, isSymbol } from './util';
import toPrimitive from "./printer";

const initialEnv = new Env();

const evalExpression = (expression: any, env: Env) => {
  if (isList(expression)) {
    return applyExpression(expression, env);
  }

  if (env.isBound(expression)) {
    return env.get(expression);
  }

  if (looksLikeBoolean(expression)) {
    return Boolean(expression);
  }

  if (looksLikeNumber(expression)) {
    return parseFloat(expression);
  }

  return expression;
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

  if (evaluatedOp instanceof Lambda) {
    const zippedArgs = _.zipObject(
      evaluatedOp.args,
      squeezeArguments(
        args.map(exp => evalExpression(exp, env)),
        evaluatedOp.args.length,
      ),
    );
    const newEnv = evaluatedOp.env.newEnv(zippedArgs);
    return evaluatedOp.body.reduce(
      (previousResult, exp) => evalExpression(exp, newEnv),
      undefined,
    );
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

  throw new Error(`Symbol "${evaluatedOp}" is not callable`);
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
  const lexemes = parseLexemes(program);
  const lists = parseLists(lexemes);

  console.log(toPrimitive(lists));

  return lists.reduce(
    (acc, sym) => evalExpression(sym, env),
    undefined,
  );
};
