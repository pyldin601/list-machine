import * as _ from 'lodash';
import optimizeTailCall from '../optimizeTailCall';
import { SPREST } from "../special";
import { isLMSymbol, LMSymbol } from "../types/";
import { isList } from "../util";

const STATE_INITIAL = 0;
const STATE_AFTER_REST = 2;

const isSprestOperator = (exp: any): boolean => {
  return isList(exp)
    && _.size(exp) === 2
    && exp.every(isLMSymbol)
    && _.head<LMSymbol>(exp).value === SPREST;
};

const getArgumentOfSprestOperator = (exp: any): LMSymbol => {
  return _.last<LMSymbol>(exp);
};

const combineArguments = (argValues: any[], argNames: any[]) => {
  if (!isList(argValues)) {
    throw new Error(`Argument combiner requires list of values`);
  }

  const packIterate = optimizeTailCall((restArgValues: any[], restArgNames: any[], state: number, acc: {}): {} => {
    if (_.includes([STATE_INITIAL, STATE_AFTER_REST], state) && _.isEmpty(restArgNames)) {
      return acc;
    }

    switch (state) {
      case STATE_AFTER_REST:
        throw new Error('Sprest argument should be last');

      case STATE_INITIAL: {
        const [argName] = restArgNames;

        if (isSprestOperator(argName)) {
          return packIterate(
            [],
            _.tail(restArgNames),
            STATE_AFTER_REST,
            { ...acc, [getArgumentOfSprestOperator(argName).value]: restArgValues },
          );
        }

        if (isList(argName)) {
          return packIterate(
            _.tail(restArgValues),
            _.tail(restArgNames),
            STATE_INITIAL,
            { ...acc, ...combineArguments(_.head(restArgValues), argName) },
          )
        }

        return packIterate(
          _.tail(restArgValues),
          _.tail(restArgNames),
          STATE_INITIAL,
          { ...acc, [_.head(restArgNames).value]: _.head(restArgValues) },
        );
      }
    }
  });

  return packIterate(argValues, argNames, STATE_INITIAL, {});
};

export default combineArguments;
