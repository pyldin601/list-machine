import { chunk, first, includes } from 'lodash';
import Env from './Env';
import { Lambda, Macro } from './types/';

export const OP_ADD = '+';
export const OP_MUL = '*';
export const OP_SUB = '-';
export const OP_DIV = '/';

export const ST_DEF = 'def';
export const LAMBDA = 'lambda';
export const MACRO = 'macro';

export const specialForms = [
  OP_ADD,
  OP_MUL,
  OP_SUB,
  OP_DIV,

  ST_DEF,
  LAMBDA,
  MACRO,
];

export const isSpecialForm = (op: string): boolean => (
  includes(specialForms, op)
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
      return args.reduce((sum, item) => sum + evalExpression(item, env), 0);
    case OP_MUL:
      return args.reduce((mul, item) => mul * evalExpression(item, env), 1);
    case OP_SUB:
      return args.slice(1).reduce((dif, item) => dif - evalExpression(item, env), first(args));
    case OP_DIV:
      return args.slice(1).reduce((dif, item) => dif / evalExpression(item, env), first(args));

    /* Language special forms */
    case ST_DEF: {
      const pairs = chunk(args, 2);
      return pairs.forEach(
        ([name, value]) => env.bind(name, evalExpression(value, env)),
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
    default:
      throw new Error(`Unknown special form - ${op}`);
  }
};
