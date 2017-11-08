import * as _ from 'lodash';
import Env from '../Env';
import { IExpressionNode, NodeType } from '../../parser/types';
import { Lambda, Macro } from '../../types';
import combineArguments from "../combineArguments";
import evalArguments from '../evalArguments';
import evaluate from '../evaluate';
import expandMacro from '../expandMacro';
import { nativeForms } from './';

export default () => {
  nativeForms.set('def', (env: Env) => (...args: any[]) => {
    const pairs = _.chunk(args, 2);
    pairs.forEach(([id, value]) => {
      if (id.type !== NodeType.ID) {
        throw new Error('Argument name should be identifier');
      }
      return env.bind(id.name, evaluate(value, env));
    });
  });

  nativeForms.set('lambda', (env: Env) => (argNames: IExpressionNode, body: IExpressionNode) => {
    return new Lambda(argNames, body, env);
  });

  nativeForms.set('macro', (env: Env) => (argNames: IExpressionNode, body: IExpressionNode) => {
    return new Macro(argNames, body);
  });

  nativeForms.set('expand', (env: Env) => (macroArg: any, ...args: any[]) => {
    const macro = evaluate(macroArg, env);
    if (!(macro instanceof Macro)) {
      throw new Error(`Form "expand" requires first argument to be a Macro`);
    }
    return macro.expand(args);
  });

  nativeForms.set('cond', (env: Env) => (...args: any[]) => {
    const pairs = _.chunk(args, 2);

    for (const pair of pairs) {
      if (pair.length === 1) {
        return evaluate(_.head(pair), env);
      }

      if (evaluate(_.head(pair), env)) {
        return evaluate(_.last(pair), env);
      }
    }

    return undefined;
  });

  nativeForms.set('eval', (env: Env) => (expr: any) => {
    return evaluate(expr, env);
  });

  nativeForms.set('eval-in', (env: Env) => (lambda: any, expr: any) => {
    const l = evaluate(lambda, env);
    if (!(l instanceof Lambda)) {
      throw new Error(`First argument should be a lambda`);
    }
    return evaluate(expr, l.env);
  });
};
