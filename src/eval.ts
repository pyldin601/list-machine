import Env from './Env';
import parseLexemes from './lexeme';
import parseLists from './list';
import { callSpecialForm, isSpecialForm } from './special';

const initialEnv = new Env();

const evalList = (list: any[], env: Env): any => {
  const [op, ...args] = list;

  if (isSpecialForm(op)) {
    return callSpecialForm(op, args, evalSymbol, env);
  }

  if (!env.isBound(op)) {
    throw new Error(`Unbound operator - ${op}`);
  }

  return evalList([env.get(op), ...args], env);
};

const evalSymbol = (symbol: any, env: Env): any => {
  // is it list?
  if (Array.isArray(symbol)) {
    return evalList(symbol, env);
  }

  // is it bound?
  if (env.isBound(symbol)) {
    return env.get(symbol);
  }

  // is it number?
  const numeric = parseFloat(symbol);

  if (!isNaN(numeric)) {
    return numeric;
  }

  // return as is
  return symbol;
};

const toString = (symbol: any) => {
  if (Array.isArray(symbol)) {
    return `(${symbol.map(toString).join(' ')})`;
  }
  return symbol;
};

export default (program: string, env: Env = initialEnv): any => {
  const lexemes = parseLexemes(program);
  const lists = parseLists(lexemes);

  return toString(lists.reduce((acc, sym) => evalSymbol(sym, env), null));
};
