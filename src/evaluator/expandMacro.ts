import { isCompositeNode } from '../common/constants';
import { IIdentifierNode, NodeType } from '../parser/types';

export interface IArguments { [name: string]: any }

const getArgumentValue = (id: IIdentifierNode, args: IArguments): any => {
  if (id.name in args) {
    return args[id.name];
  }
  return id;
};

const expandMacro = (expr: any, args: IArguments): any => {
  if (expr.type === NodeType.ID) {
    return getArgumentValue(expr, args);
  }

  if (expr.type === NodeType.SPREST_EXPRESSION) {
    return { ...expr, value: expandMacro(expr.value, args) };
  }

  if (isCompositeNode(expr)) {
    const body = expr.body.reduce((expandedExpr: any[], expression: any) => {
      return [...expandedExpr, expandMacro(expression, args)];
    }, []);

    return { ...expr, body };
  }

  return expr;
};

export default expandMacro;
