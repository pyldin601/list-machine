import * as _ from 'lodash';
import Env from './Env';
import getGlobal from './global';
import toList from './list';
import lmCore from './lmcore';
import { callSpecialForm, isSpecialForm, QUOTE } from './special';
import parse, { ASTERISK } from './tokens';
import { isLMSymbol, isLMType, Lambda, LMSymbol, Macro } from './types';
import { isEmptyList, isList, isSymbol } from './util';

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

const packArguments = (argValues: any[], argNames: LMSymbol[]) => {
  const lastArgNameIndex = _.size(argNames) - 1;

  const asteriskEntries = argNames
    .map(name => ({ name, index: argNames.indexOf(name) }))
    .filter(({ name, index }) => isSymbolWithAsterisk(name));

  if (asteriskEntries.some(({ index }) => index !== lastArgNameIndex)) {
    throw new Error(`Symbol prefixed with asterisk should be last in the arguments list`);
  }

  const packIterate = (restArgValues: any[], restArgNames: LMSymbol[], acc: {}): {} => {
    if (_.isEmpty(restArgNames)) {
      return acc;
    }

    if (isSymbolWithAsterisk(_.head(restArgNames))) {
      return packIterate(
        [],
        _.tail(restArgNames),
        { ...acc, [_.head(restArgNames).value.slice(1)]: restArgValues },
      );
    }

    return packIterate(
      _.tail(restArgValues),
      _.tail(restArgNames),
      {...acc, [_.head(restArgNames).value]: _.head(restArgValues) },
    );
  };

  return packIterate(argValues, argNames, {});
};

const evaluateArgs = (args: any[], env: Env) => {
  return args.reduce((acc: any[], arg: any) => {
    if (isSymbolWithAsterisk(arg)) {
      const withoutAsterisk = new LMSymbol(arg.value.slice(1));
      return [...acc, ...evalExpression(withoutAsterisk, env)];
    }
    return [...acc, evalExpression(arg, env)];
  }, []);
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
  const iterateExpand = (rest: any[], expanded: any[]): any[] => {
    if (_.isEmpty(rest)) {
      return expanded;
    }
    const [exp, nextExp, ...restExps] = rest;

    // Spread operator
    if (exp === ASTERISK) {
      if (nextExp === ASTERISK) {
        return iterateExpand([nextExp, ...restExps], [...expanded, ASTERISK]);
      }

      if (isLMSymbol(nextExp) && nextExp.value in args) {
        return iterateExpand(restExps, [...expanded, ...args[nextExp.value]]);
      }

      return iterateExpand(restExps, [...expanded, exp, nextExp]);
    }

    if (isLMSymbol(exp) && exp.value in args) {
      return iterateExpand([nextExp, ...restExps], [...expanded, args[exp.value]]);
    }

    return iterateExpand([nextExp, ...restExps], [...expanded, exp]);
  };
  return iterateExpand(body, []);
};

const evaluateArgs = (args: any[], env: Env): any[] => {
  const iterateEvalArgs = (rest: any[], evaluated: any[]): any[] => {
    if (_.isEmpty(rest)) {
      return evaluated;
    }

    const [arg, nextArg, ...restArgs] = rest;

    if (arg === ASTERISK) {
      if (nextExp === ASTERISK) {
        throw new Error('Double spread operator allowed only in macro');
      }

      return iterateEvalArgs(
        restArgs,
        [...evaluated, ...evalExpression(arg, env)],
      )
    }

    return iterateEvalArgs(
      [nextArg, ...restArgs],
      [...evaluated, evalExpression(arg, env)],
    )
  }
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
