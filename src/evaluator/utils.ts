import { Identifier, List } from "../types";

export const isSpreadExpression = (expr: any) => {
  return expr instanceof List
    && expr.length === 2
    && expr.head instanceof Identifier
    && expr.head.name === 'sprest';
};

export const isRestExpression = (expr: any) => {
  return isSpreadExpression(expr) && expr.tail.head instanceof Identifier;
};
