import { isCompositeNode } from '../common/constants';
import { IExpressionNode, INode, NodeType } from '../parser/types';

export interface IArguments { [name: string]: any }

const getNodeValue = (exp: INode, args: IArguments) => {
  if (exp.type === NodeType.ID && exp.name in args) {
    return args[exp.name];
  }
  return exp;
};

const expandExpression = (exp: INode, args: IArguments): any => {
  if (!isCompositeNode(exp)) {
    return getNodeValue(exp, args);
  }

  const expressionBody = (exp as IExpressionNode).body;
  const newBody = expressionBody.reduce((expandedExpression: INode[], expression: INode) => {
    if (expression.type === NodeType.SPREST_EXPRESSION) {
      return expandedExpression.concat(expandExpression(expression.value, args));
    }
    return [...expandedExpression, expandExpression(expression, args)];
  }, []);

  return { ...exp, body: newBody };
};

export default expandExpression;
