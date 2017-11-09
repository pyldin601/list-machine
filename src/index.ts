import { Env, evaluate as evalExpression, valueOf } from './evaluator';
import listify from './evaluator/listify';
import { parse, tokenize } from './parser';

const evaluate = (code: string, env: Env) => evalExpression(listify(parse(code)), env);

export { tokenize, parse, evaluate, Env, valueOf };
