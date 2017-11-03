import * as _ from 'lodash';
import optimizeTailCall from '../optimizeTailCall';
import { SPREST } from "../special";
import LMSymbol from "../types/LMSymbol";
import { isList } from "../util";

const STATE_INITIAL = 0;
const STATE_AFTER_REST = 2;

export default (argValues: any[], argNames: any[]) => {
  const packIterate = optimizeTailCall((restArgValues: any[], restArgNames: any[], state: number, acc: {}): {} => {
    if (_.includes([STATE_INITIAL, STATE_AFTER_REST], state) && _.isEmpty(restArgNames)) {
      return acc;
    }

    switch (state) {
      case STATE_AFTER_REST:
        throw new Error('Rest argument should be last');

      case STATE_INITIAL: {
        const [argName] = restArgNames;

        if (isList(argName) && _.head<LMSymbol>(argName).value === SPREST) {
          return packIterate(
            [],
            _.tail(restArgNames),
            STATE_AFTER_REST,
            { ...acc, [_.last<LMSymbol>(argName).value]: restArgValues },
          );
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
