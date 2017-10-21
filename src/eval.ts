import * as _ from 'lodash';
import Env from './Env';
import parseLexemes from './lexeme';
import parseLists from './list';
import { callSpecialForm, isSpecialForm } from './special';
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
      args.map(exp => evalExpression(exp, env)),
    );
    const newEnv = evaluatedOp.env.newEnv(zippedArgs);
    return evaluatedOp.body.reduce(
      (previousResult, exp) => evalExpression(exp, newEnv),
      null,
    );
  }

  if (evaluatedOp instanceof Macro) {
    const zippedArgs = _.zipObject(evaluatedOp.args, args);
    return proceedMacro(zippedArgs, evaluatedOp.body).reduce(
      (previousResult, exp) => evalExpression(exp, env),
      null,
    );
  }

  return [evaluatedOp, ...args];
};

const proceedMacro = (args: any, body: any): any => {
  return body.map(exp => {
    if (isList(exp)) {
      return proceedMacro(args, exp);
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

  return lists.reduce(
    (acc, sym) => evalExpression(sym, env),
    null,
  );
};
