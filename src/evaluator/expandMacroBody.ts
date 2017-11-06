import { isCompositeNode } from '../common/constants';
import { IIdentifierNode, INode, NodeType } from '../parser/types';

export interface IArguments { [name: string]: any }

const getArgumentValue = (id: IIdentifierNode, args: IArguments): any => {
  if (id.name in args) {
    return args[id.name];
  }
  return id;
};

const expandMacroBody = (expr: any, args: IArguments): any => {
  if (expr.type === NodeType.ID) {
    return getArgumentValue(expr, args);
  }

  if (isCompositeNode(expr)) {
    const body = expr.body.reduce((expandedExpr: any[], expression: INode) => {
      if (expression.type === NodeType.SPREST_EXPRESSION) {
        return expandedExpr.concat(expandMacroBody(expression.value, args));
      }
      return [...expandedExpr, expandMacroBody(expression, args)];
    }, []);

    return { ...expr, body };
  }

  return expr;
};

export default expandMacroBody;
