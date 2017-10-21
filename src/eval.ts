import * as _ from 'lodash';
import Env from './Env';
import parseLexemes from './lexeme';
import parseLists from './list';
import { callSpecialForm, isSpecialForm } from './special';
import { Lambda } from './types';

const initialEnv = new Env();

const evalExpression = (expression: any, env: Env) => {
  if (!Array.isArray(expression)) {
    if (env.isBound(expression)) {
      return env.get(expression);
    }
    return tryNumber(expression);
  }
  if (_.isEmpty(expression)) {
    return expression;
  }
  return applyExpression(expression, env);
};

const applyExpression = ([op, ...args]: any, env: Env) => {
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
      (_, expression) => evalExpression(expression, newEnv),
      null,
    );
  }

  return [evaluatedOp, ...args];
};

const tryNumber = (value: string): any => {
  const numeric = parseFloat(value);

  if (isNaN(numeric)) {
    return value;
  }

  return numeric;
};

export default (program: string, env: Env = initialEnv): any => {
  const lexemes = parseLexemes(program);
  const lists = parseLists(lexemes);

  return lists.reduce(
    (acc, sym) => evalExpression(sym, env),
    null,
  );
};
