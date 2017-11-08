import { IExpressionNode, NodeType } from '../parser/types';

export interface IArguments { [name: string]: any }

const combineArguments = (argNamesExpression: IExpressionNode, argValues: any[]): IArguments => {
  let afterRest = false;

  if (!Array.isArray(argValues)) {
    throw new Error(`Argument of type "${typeof argValues}" can not be destructed`);
  }

  if (argNamesExpression.type !== NodeType.BRACKET_EXPRESSION) {
    throw new Error(`Argument list should be wrapped in to brackets`);
  }

  const args: { [name: string]: any } = {};
  const { body } = argNamesExpression;

  for (let i = 0; i < body.length; i += 1) {
    if (afterRest) {
      throw new Error('Rest argument should be the last');
    }

    const argNameExpression = body[i];
    const argValue = argValues[i];

    if (argNameExpression.type === NodeType.ID) {
      args[argNameExpression.name] = argValue;
    } else if (argNameExpression.type === NodeType.BRACKET_EXPRESSION) {
      Object.assign(args, combineArguments(argNameExpression, argValue));
    } else if (
      argNameExpression.type === NodeType.SPREST_EXPRESSION &&
      argNameExpression.value.type === NodeType.ID
    ) {
      args[argNameExpression.value.name] = argValues.slice(i);
      afterRest = true;
    } else {
      throw new Error(`Wrong type of argument - ${argNameExpression.type}`);
    }
  }

  return args;
};

export default combineArguments;
