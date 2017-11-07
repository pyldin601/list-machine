import * as _ from 'lodash';
import Env from './Env';
import { combineArguments, evaluateArgs, expandMacro } from "./evalCore";
import print from './printer';
import { Lambda, Macro } from './types/';
import Cons from "./types/Cons";

export const LIST_CONS = 'cons';
export const LIST_CAR = 'car';
export const LIST_CDR = 'cdr';

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
export const EXPAND = 'expand';
export const QUOTE = 'quote';
export const EVAL = 'eval';
export const EVAL_IN = 'eval-in';
export const COND = 'cond';
export const SPREST = 'sprest';

export const EXP_LIST = 'list';
export const EXP_NEW = 'new';
export const EXP_PRINT = 'print!';

export const ATTR_GET = 'get-attr';
export const ATTR_SET = 'set-attr!';
export const ATTR_HAS = 'has-attr?';
export const ATTR_DEL = 'del-attr!';

export const specialForms = [
  LIST_CONS,
  LIST_CAR,
  LIST_CDR,

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
  EXPAND,
  QUOTE,
  EVAL,
  EVAL_IN,
  COND,
  SPREST,

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
) => {
  const evaluatedArguments = evaluateArgs(args, (exp: any) => evalExpression(exp, env));
  return _.tail(evaluatedArguments).reduce((arg, item) => op(arg, item), _.head(evaluatedArguments));
};

export const callSpecialForm = (
  op: string,
  args: any[],
  evalExpression: (expression: any, env: Env) => any,
  env: Env,
): any => {
  const evalArgs = (args: any[]) => evaluateArgs(args, (exp: any) => evalExpression(exp, env));

  switch (op) {
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

    case LIST_CONS: {
      const evaluatedArguments = args.map(arg => evalExpression(arg, env));
      const [firstItem, ...restItems] = evaluatedArguments.reverse();
      return restItems.reduce((list, elem) => new Cons(elem, list), new Cons(firstItem));
    }

    case LIST_CAR:
      return evalExpression(_.head(args), env).car;

    case LIST_CDR:
      return evalExpression(_.head(args), env).cdr;

    case OP_NOT:
      return !evalExpression(_.head(args), env);

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

    case EXPAND: {
      const macro = evalExpression(_.head(args), env);
      if (!(macro instanceof Macro)) {
        throw new Error(`Form "expand" requires first argument to be a Macro`);
      }
      const combinedArgs = combineArguments(
        evalArgs(_.tail(args)),
        macro.args,
      );
      return _.flatten(expandMacro(combinedArgs, macro.body));
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

    case SPREST:
      throw new Error(`Sprest operator is not callable form`);

    case EXP_LIST:
      return evalArgs(args);

    case EXP_PRINT:
      evalArgs(args)
        .map(print)
        .forEach(val => console.log(val));
      return undefined;

    case EXP_NEW: {
      const evaluatedArgs = evalArgs(args);
      const Obj = _.head(evaluatedArgs);
      return new Obj(..._.tail(evaluatedArgs));
    }

    case ATTR_GET: {
      const [object, attr] = evalArgs(args);
      return object[attr];
    }

    case ATTR_SET: {
      const [object, attr, value] = evalArgs(args);
      object[attr] = value;
      return undefined;
    }

    case ATTR_HAS: {
      const [object, attr] = evalArgs(args);
      return attr in object;
    }

    case ATTR_DEL: {
      const [object, attr] = evalArgs(args);
      delete object[attr];
      return undefined;
    }

    default:
      throw new Error(`Unknown special form - ${op}`);
  }
};
