import { chunk, first, head, includes, tail } from 'lodash';
import Env from './Env';

export const OP_ADD = 'OP_ADD';
export const OP_MUL = 'OP_MUL';
export const OP_SUB = 'OP_SUB';
export const OP_DIV = 'OP_DIV';
export const ST_DEF = 'def';

export const specialForms = [
  OP_ADD,
  OP_MUL,
  OP_SUB,
  OP_DIV,
  ST_DEF,
];

export const isSpecialForm = (op: symbol): boolean => (
  includes(specialForms, op)
);

export const callSpecialForm = (
  op: symbol,
  list: any[],
  parse: (sym: any, env: Env) => any,
  env: Env,
): any => {
  switch (op) {
    /* Math operators */
    case OP_ADD:
      return list.reduce((sum, item) => sum + parse(item, env), 0);
    case OP_MUL:
      return list.reduce((mul, item) => mul * parse(item, env), 1);
    case OP_SUB:
      return list.slice(1).reduce((dif, item) => dif - parse(item, env), first(list));
    case OP_DIV:
      return list.slice(1).reduce((dif, item) => dif / parse(item, env), first(list));

    /* Language special forms */
    case ST_DEF: {
      const pairs = chunk(list, 2);
      return pairs.forEach(
        ([name, value]) => env.bind(name, parse(value, env)),
      );
    }
  }
};
