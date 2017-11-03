import * as _ from 'lodash';
import Env from './Env';
import print from './printer';
import { isLMSymbol, isValidArgumentType, Lambda, Macro } from './types/';
import { isList } from './util';

export const OP_ADD = '+';
export const OP_MUL = '*';
export const OP_SUB = '-';
export const OP_DIV = '/';
export const OP_MOD = 'mod';

export const OP_EQ = 'eq?';
export const OP_NE = 'ne?';
export const OP_GT = 'gt?';
export const OP_LT = 'lt?';
export const OP_GTE = 'gte?';
export const OP_LTE = 'lte?';
export const OP_OR = 'or';
export const OP_AND = 'and';
export const OP_NOT = 'not';

export const ST_DEF = 'def';
export const LAMBDA = 'lambda';
export const MACRO = 'macro';
export const QUOTE = 'quote';
export const EVAL = 'eval';
export const EVAL_IN = 'eval-in';
export const COND = 'cond';

export const EXP_LIST = 'list';
export const EXP_NEW = 'new';
export const EXP_PRINT = 'print!';

export const ATTR_GET = 'get-attr';
export const ATTR_SET = 'set-attr!';
export const ATTR_HAS = 'has-attr?';
export const ATTR_DEL = 'del-attr!';

export const specialForms = [
  OP_ADD,
  OP_MUL,
  OP_SUB,
  OP_DIV,
  OP_MOD,

  OP_EQ,
  OP_NE,
  OP_GT,
  OP_LT,
  OP_GTE,
  OP_LTE,
  OP_OR,
  OP_AND,
  OP_NOT,

  ST_DEF,
  LAMBDA,
  MACRO,
  QUOTE,
  EVAL,
  EVAL_IN,
  COND,

  EXP_LIST,
  EXP_NEW,
  EXP_PRINT,

  ATTR_GET,
  ATTR_SET,
  ATTR_HAS,
  ATTR_DEL,
];


export const isSpecialForm = (op: string): boolean => (
  _.includes(specialForms, op)
);

export const reduceArguments = (
  op: (arg1: any, arg2: any) => any,
  args: any[],
  evalExpression: (expression: any, env: Env) => any,
  env: Env,
) => (
  args
    .slice(1)
    .reduce((arg, item) => op(arg, evalExpression(item, env)), evalExpression(_.first(args), env))
);

export const callSpecialForm = (
  op: string,
  args: any[],
  evalExpression: (expression: any, env: Env) => any,
  env: Env,
): any => {
  switch (op) {
    /* Math operators */
    case OP_ADD:
      return reduceArguments((arg1, arg2) => arg1 + arg2, args, evalExpression, env);

    case OP_MUL:
      return reduceArguments((arg1, arg2) => arg1 * arg2, args, evalExpression, env);

    case OP_SUB:
      return reduceArguments((arg1, arg2) => arg1 - arg2, args, evalExpression, env);

    case OP_DIV:
      return reduceArguments((arg1, arg2) => arg1 / arg2, args, evalExpression, env);

    case OP_MOD:
      return reduceArguments((arg1, arg2) => arg1 % arg2, args, evalExpression, env);

    case OP_EQ:
      return reduceArguments((arg1, arg2) => arg1 === arg2, args, evalExpression, env);

    case OP_NE:
      return reduceArguments((arg1, arg2) => arg1 !== arg2, args, evalExpression, env);

    case OP_GT:
      return reduceArguments((arg1, arg2) => arg1 > arg2, args, evalExpression, env);

    case OP_LT:
      return reduceArguments((arg1, arg2) => arg1 < arg2, args, evalExpression, env);

    case OP_GTE:
      return reduceArguments((arg1, arg2) => arg1 >= arg2, args, evalExpression, env);

    case OP_LTE:
      return reduceArguments((arg1, arg2) => arg1 <= arg2, args, evalExpression, env);

    case OP_AND:
      return reduceArguments((arg1, arg2) => arg1 && arg2, args, evalExpression, env);

    case OP_OR:
      return reduceArguments((arg1, arg2) => arg1 || arg2, args, evalExpression, env);

    case OP_NOT:
      return !evalExpression(_.head(args), env);

    /* Language special forms */
    case ST_DEF: {
      const pairs = _.chunk(args, 2);
      return pairs.forEach(
        ([name, value]) => env.bind(name.value, evalExpression(value, env)),
      );
    }

    case LAMBDA: {
      const [lambdaArgs, ...lambdaBody] = args;
      return new Lambda(lambdaArgs, lambdaBody, env);
    }

    case MACRO: {
      const [macroArgs, ...macroBody] = args;

      return new Macro(macroArgs, macroBody);
    }

    case QUOTE:
      return _.head(args);

    case EVAL:
      return evalExpression(_.head(args), env);

    case EVAL_IN: {
      const lambda = evalExpression(_.head(args), env);
      if (!(lambda instanceof Lambda)) {
        throw new Error(`First argument must be lambda`);
      }
      return evalExpression(args[1], lambda.env);
    }

    case COND: {
      const pairs = _.chunk(args, 2);
      for (const pair of pairs) {
        if (pair.length === 1) {
          return evalExpression(_.head(pair), env);
        }

        if (evalExpression(_.head(pair), env)) {
          return evalExpression(_.last(pair), env);
        }
      }
      return undefined;
    }

    case EXP_LIST:
      return args.map(arg => evalExpression(arg, env));

    case EXP_PRINT:
      args
        .map(arg => evalExpression(arg, env))
        .map(print)
        .forEach(val => console.log(val));
      return undefined;

    case EXP_NEW: {
      const evaluatedArgs = args.map(arg => evalExpression(arg, env));
      const Obj = _.head(evaluatedArgs);
      return new Obj(..._.tail(evaluatedArgs));
    }

    case ATTR_GET: {
      const [object, attr] = args.map(arg => evalExpression(arg, env));
      return object[attr];
    }

    case ATTR_SET: {
      const [object, attr, value] = args.map(arg => evalExpression(arg, env));
      object[attr] = value;
      return undefined;
    }

    case ATTR_HAS: {
      const [object, attr] = args.map(arg => evalExpression(arg, env));
      return attr in object;
    }

    case ATTR_DEL: {
      const [object, attr] = args.map(arg => evalExpression(arg, env));
      delete object[attr];
      return undefined;
    }

    default:
      throw new Error(`Unknown special form - ${op}`);
  }
};
