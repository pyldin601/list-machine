import Env from './Env';
import parseLexemes from './lexeme';
import parseLists from './list';
import { callSpecialForm, isSpecialForm } from './special';

const initialEnv = new Env();

const evalExpression = (expression: any, env: Env) => {
  if (!Array.isArray(expression)) {
    return env.get(expression);
  }
  return applyExpression(expression, env);
};

const applyExpression = ([op, ...args]: any, env: Env) => {
  if (isSpecialForm(op)) {
    return callSpecialForm(op, args, evalExpression, env);
  }
  throw new Error(`Unknown operation - ${op}`);
};

const toString = (expression: any): string => {
  if (Array.isArray(expression)) {
    return `(${expression.map(toString).join(' ')})`;
  }
  return String(expression);
};

export default (program: string, env: Env = initialEnv): any => {
  const lexemes = parseLexemes(program);
  const lists = parseLists(lexemes);

  return lists.reduce(
    (acc, sym) => evalExpression(sym, env),
    null,
  );
};


//
// const evalList = (list: any[], env: Env): any => {
//   const [op, ...args] = list;
//
//   if (isSpecialForm(op)) {
//     return callSpecialForm(op, args, evalSymbol, env);
//   }
//
//   if (!env.isBound(op)) {
//     throw new Error(`Unbound operator - ${op}`);
//   }
//
//   return evalList([env.get(op), ...args], env);
// };
//
// const evalSymbol = (symbol: any, env: Env): any => {
//   // is it list?
//   if (Array.isArray(symbol)) {
//     return evalList(symbol, env);
//   }
//
//   // is it bound?
//   if (env.isBound(symbol)) {
//     return env.get(symbol);
//   }
//
//   // is it number?
//   const numeric = parseFloat(symbol);
//
//   if (!isNaN(numeric)) {
//     return numeric;
//   }
//
//   // return as is
//   return symbol;
// };
//
