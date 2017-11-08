import { Env, evaluate as evalExpression, valueOf } from './evaluator';
import { parse, tokenize } from './parser';

const evaluate = (code: string, env: Env) => evalExpression(parse(code), env);

export { tokenize, parse, evaluate, Env, valueOf };
