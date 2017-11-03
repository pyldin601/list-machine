import * as _ from 'lodash';
import Env from './Env';
import getGlobal from './global';
import toList from './list';
import lmCore from './lmcore';
import optimizeTailCall from './optimizeTailCall';
import { callSpecialForm, isSpecialForm, QUOTE } from './special';
import parse, { ASTERISK } from './tokens';
import { isLMSymbol, isLMType, Lambda, LMSymbol, Macro } from './types';
import { isEmptyList, isList } from './util';

const globalJSObject: { [key: string]: any } = getGlobal();

export const initializeEnv = () => {
  const env = new Env();
  evaluate(lmCore, env);
  return env;
};

const isSymbolWithAsterisk = (sym: LMSymbol) => _.head(sym.value) === '*';

const evalLMSymbol = (symbol: LMSymbol, env: Env): any => {
  const { value } = symbol;
  if (env.isBound(value)) {
    return env.get(value);
  }

  if (isJsCall(value)) {
    return globalJSObject[value.slice(3)];
  }

  return symbol;
};

const evalExpression = (expression: any, env: Env): any => {
  if (isList(expression)) {
    return applyExpression(expression, env);
  }

  if (isLMSymbol(expression)) {
    return evalLMSymbol(expression, env);
  }

  return expression;
};

const isMethodCall = (op: any): boolean => {
  return isLMSymbol(op) && (op.value[0] === '.');
};

const isJsCall = (exp: any): boolean => {
  return typeof exp === 'string' && exp.slice(0, 3) === 'js/';
};

const evalAndQuoteNativeList = (list: any, env: Env): any => {
  if (isEmptyList(list)) {
    return list;
  }

  return list.map((item: any) => {
    if (isList(item)) {
      return [new LMSymbol(QUOTE), evalAndQuoteNativeList(item, env)];
    }
    return evalExpression(item, env);
  });
};

const applyExpression = (expression: any, env: Env) => {
  if (isEmptyList(expression)) {
    return expression;
  }

  const [op, ...args] = expression;
  const evaluatedOp = evalExpression(op, env);

  if (isLMSymbol(evaluatedOp) && isSpecialForm(evaluatedOp.value)) {
    return callSpecialForm(evaluatedOp.value, args, evalExpression, env);
  }

  if (evaluatedOp instanceof Macro) {
    const packedArgs = packArguments(args, evaluatedOp.args);

    return expandMacro(packedArgs, evaluatedOp.body).reduce(
      (previousResult: any, exp: any) => evalExpression(exp, env),
      undefined,
    );
  }

  const evaluatedArgs = evaluateArgs(args, env);

  if (isMethodCall(evaluatedOp)) {
    return callMethod(env, evaluatedOp.value.slice(1), _.first(evaluatedArgs), _.tail(evaluatedArgs));
  }

  if (evaluatedOp instanceof Lambda) {
    const packedArgs = packArguments(evaluatedArgs, evaluatedOp.args);
    const newEnv = evaluatedOp.env.newEnv(packedArgs);

    return evaluatedOp.body.reduce(
      (previousResult, exp) => evalExpression(exp, newEnv),
      undefined,
    );
  }

  if (typeof evaluatedOp === 'function') {
    return evaluatedOp(...evaluatedArgs);
  }

  throw new Error(`Symbol "${evaluatedOp}" is not callable`);
};

const packArguments = (argValues: any[], argNames: any[]) => {
  const packIterate = (restArgValues: any[], restArgNames: LMSymbol[], isRest: boolean, acc: {}): {} => {
    if (_.isEmpty(restArgNames)) {
      return acc;
    }

    if (isRest) {
      if (_.head(restArgNames) === ASTERISK) {
        throw new Error('Multiple asterisks are not allowed');
      }

      return packIterate(
        [],
        _.tail(restArgNames),
        false,
        {
          ...acc,
          [_.head(restArgNames).value]: restArgNames,
        },
      );
    }

    if (_.head(restArgNames) === ASTERISK) {
      return packIterate(restArgValues, _.tail(restArgNames), true, acc);
    }

    return packIterate(
      _.tail(restArgValues),
      _.tail(restArgNames),
      false,
      {
        ...acc,
        [_.head(restArgNames).value]: _.head(restArgValues),
      },
    );
  };

  return packIterate(argValues, argNames, {});
};

// todo: split types to js and non-js
const callMethod = (env: Env, method: string, object: any, args: any[]): any => {
  const patchedArgs = args.map(arg => {
    if (arg instanceof Lambda && !isLMType(object)) {
      return (...innerArgs: any[]) => {
        const evaluatedArguments = evalAndQuoteNativeList(innerArgs, env);
        return applyExpression([arg, ...evaluatedArguments], env);
      };
    }
    return arg;
  });
  return object[method](...patchedArgs);
};

const expandMacro = (args: any, body: any): any => {
  const expandSymbol = (exp: any) => {
    if (isLMSymbol(exp) && exp.value in args) {
      return args[exp.value];
    }
    return exp;
  };

  const iterateExpand = optimizeTailCall((restExps: any[], isSpread: boolean, expanded: any[]): any[] => {
    if (_.isEmpty(restExps)) {
      return expanded;
    }

    const [headExp, ...tailExps] = restExps;

    if (isSpread) {
      if (headExp === ASTERISK) {
        throw new Error('Multiple spread operator does not allowed');
      }

      return iterateExpand(tailExps, false, expanded.concat(expandSymbol(headExp)));
    }

    if (headExp === ASTERISK) {
      return iterateExpand(tailExps, true, expanded);
    }

    return iterateExpand(tailExps, [...expanded, expandSymbol(headExp)]);
  });

  return iterateExpand(body, false, []);
};

const evaluateArgs = (args: any[], env: Env): any[] => {
  const iterateEvalArgs = optimizeTailCall((restArgs: any[], isSpread: boolean, evaluatedArgs: any[]): any[] => {
    if (_.isEmpty(restArgs)) {
      return evaluatedArgs;
    }

    const [headArg, ...tailArgs] = restArgs;

    if (isSpread) {
      if (headArg === ASTERISK) {
        throw new Error('Multiple spread operator does not allowed');
      }

      return iterateEvalArgs(
        tailArgs,
        false,
        evaluatedArgs.concat(evalExpression(headArg, env)),
      );
    }

    if (headArg === ASTERISK) {
      return iterateEvalArgs(tailArgs, true, evaluatedArgs);
    }

    return iterateEvalArgs(
      tailArgs,
      false,
      [...evaluatedArgs, evalExpression(headArg, env)],
    )
  });

  return iterateEvalArgs(args, false, []);
};

const evaluate = (program: string, env: Env = initializeEnv()): any => {
  const tokens = parse(program);

  const list = toList(tokens);

  return list.reduce(
    (acc: any, sym: any) => evalExpression(sym, env),
    undefined,
  );
};

export default evaluate;
