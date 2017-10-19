import * as _ from 'lodash';
import Env from './Env';
import parseLexemes from './lexeme';
import parseLists from './list';
import { callSpecialForm, isSpecialForm } from './special';
import { Lambda } from './types';
import toPrimitive from "./printer";

const initialEnv = new Env();

const evalExpression = (expression: any, env: Env) => {
  if (!Array.isArray(expression)) {
    return env.get(expression);
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
    const zippedArgs = _.zipObject(evaluatedOp.args, args);
    return evalExpression(
      evaluatedOp.body,
      evaluatedOp.env.newEnv(zippedArgs),
    );
  }

  return [evaluatedOp, ...args];
};

export default (program: string, env: Env = initialEnv): any => {
  const lexemes = parseLexemes(program);
  const lists = parseLists(lexemes);

  return lists.reduce(
    (acc, sym) => evalExpression(sym, env),
    null,
  );
};
