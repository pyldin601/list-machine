import { List } from '../types';
import Env from './Env';
import { evalExpr } from './evaluate';
import { isSpreadExpression } from './utils';

export default (args: List<any>, env: Env): List<any> => {
  return args.reduce((evaluatedArgs: List<any>, expr: any) => {
    if (isSpreadExpression(expr)) {
      const result = evalExpr(expr.tail.head, env);
      if (Array.isArray(result)) {
        return evaluatedArgs.concat(List.of(result));
      }
      if (result instanceof List) {
        return evaluatedArgs.concat(result);
      }
      throw new Error(`Could not spread result of type ${typeof result}`);
    }

    return evaluatedArgs.append(evalExpr(expr, env));
  }, List.Nil);
};
