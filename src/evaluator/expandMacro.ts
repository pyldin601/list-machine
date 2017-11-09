import { Identifier, List } from '../types';
import { isSpreadExpression } from "./utils";
import valueOf from "./valueOf";

export interface IArguments { [name: string]: any }

const getArgumentValue = (id: Identifier, args: IArguments): any => {
  if (id.name in args) {
    return args[id.name];
  }
  return id;
};

const expandMacro = (expr: any, args: IArguments): any => {
  if (expr instanceof Identifier) {
    return getArgumentValue(expr, args);
  }

  if (Array.isArray(expr)) {
    return expr.map(item => expandMacro(item, args));
  }

  if (expr instanceof List) {
    return expr.reduce((acc, item) => {
      if (isSpreadExpression(item)) {
        const result = expandMacro(item.tail.head, args);
        if (!(result instanceof List)) {
          throw new Error(`Could not use spread in ${valueOf(expr)}`);
        }
        return acc.concat(result);
      }
      return acc.append(expandMacro(item, args));
    }, List.Nil);
  }

  return expr;
};

export default expandMacro;
