import { isCompositeNode } from '../common/constants';
import { IExpressionNode, INode, NodeType } from '../parser/types';

export interface IArguments { [name: string]: any }

const getNodeValue = (exp: INode, args: IArguments) => {
  if (exp.type === NodeType.ID && exp.name in args) {
    return args[exp.name];
  }
  return exp;
};

const expandExpression = (expr: INode, args: IArguments): any => {
  if (!isCompositeNode(expr)) {
    return getNodeValue(expr, args);
  }

  const body = (expr as IExpressionNode).body;
  const newBody = body.reduce((expandedExpr: INode[], expression: INode) => {
    if (expression.type === NodeType.SPREST_EXPRESSION) {
      return expandedExpr.concat(expandExpression(expression.value, args));
    }
    return [...expandedExpr, expandExpression(expression, args)];
  }, []);

  return { ...expr, body: newBody };
};

export default expandExpression;
