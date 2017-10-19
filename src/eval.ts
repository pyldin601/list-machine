import * as _ from 'lodash';
import Env from './Env';
import parseLexemes from './lexeme';
import parseLists from './list';
import toPrimitive from './printer';
import { callSpecialForm, isSpecialForm } from './special';
import { Lambda } from './types';

const initialEnv = new Env();

const evalExpression = (expression: any, env: Env) => {
  if (!Array.isArray(expression)) {
    return env.get(expression);
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

  return evaluatedOp;
};

export default (program: string, env: Env = initialEnv): any => {
  const lexemes = parseLexemes(program);
  const lists = parseLists(lexemes);

  return toPrimitive(lists.reduce(
    (acc, sym) => evalExpression(sym, env),
    null,
  ));
};
