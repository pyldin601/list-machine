import * as _ from 'lodash';
import { SPREST } from "../special";
import { isLMSymbol } from '../types';
import LMSymbol from "../types/Symbol";
import { isList } from "../util";

const isSprestExpression = (exp: any) => (
  isList(exp)
  && _.size(exp) === 2
  && isLMSymbol(_.head(exp))
  && _.head<LMSymbol>(exp).value === SPREST
);

const getSprestArgument = (exp: any) => _.last(exp);

const expandMacro = (args: any, body: any): any => {
  const expandSymbol = (exp: any) => {
    if (isLMSymbol(exp) && exp.value in args) {
      return args[exp.value];
    }
    return exp;
  };

  const expandExpression = (exp: any) => isList(exp) ? expandMacro(args, exp) : expandSymbol(exp);

  return body.reduce((expandedExpression: any[], expression: any) => {
    if (isSprestExpression(expression)) {
      return expandedExpression.concat(expandExpression(getSprestArgument(expression)));
    }
    return [...expandedExpression, expandExpression(expression)];
  }, []);
};

export default expandMacro;