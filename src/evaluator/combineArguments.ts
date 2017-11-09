import { Identifier, List } from '../types';
import { isRestExpression } from './utils';

export interface IArguments { [name: string]: any }

const combineArguments = (argNames: any[], argValues: List<any>): IArguments => {
  let afterRest = false;

  if (!(argValues instanceof List)) {
    throw new Error(`Argument of type "${typeof argValues}" could not be destructed`);
  }

  if (!Array.isArray(argNames)) {
    throw new Error(`Wrong type of argument list`);
  }

  let values = argValues;

  const args: { [name: string]: any } = {};

  for (const argName of argNames) {
    if (values === undefined) {
      throw new Error('Not enough arguments');
    }

    if (afterRest) {
      throw new Error('Rest argument should be the last');
    }

    if (argName instanceof Identifier) {
      args[argName.name] = values.head;
    } else if (Array.isArray(argName)) {
      Object.assign(args, combineArguments(argName, values.head));
    } else if (isRestExpression(argName)) {
      args[argName.tail.head.name] = values;
      afterRest = true;
    } else {
      throw new Error(`Wrong type of argument - ${typeof argName}`);
    }

    values = values.tail;
  }

  return args;
};

export default combineArguments;
