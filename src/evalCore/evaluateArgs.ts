import * as _ from 'lodash';
import { SPREST } from "../special";
import { isLMSymbol } from "../types/index";
import LMSymbol from "../types/LMSymbol";
import { isList } from "../util";

const isSprestExpression = (exp: any) => (
  isList(exp)
    && _.size(exp) === 2
    && isLMSymbol(_.head(exp))
    && _.head<LMSymbol>(exp).value === SPREST
);

const getSprestArgument = (exp: any) => _.last(exp);

export default (args: any[], evalFn: (exp: any) => any): any[] => {
  return args.reduce((evaluateArgs: any[], arg: any) => {
    if (isSprestExpression(arg)) {
      return evaluateArgs.concat(evalFn(getSprestArgument(arg)));
    }

    return [...evaluateArgs, evalFn(arg)];
  }, []);
};
