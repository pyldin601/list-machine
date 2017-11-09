import * as _ from 'lodash';
import { Identifier, Lambda, List, Macro } from '../../types';
import Env from '../Env';
import { evalExpr } from '../evaluate';
import { nativeForms } from './';

export default () => {
  nativeForms.set('def', (env: Env) => (args: List<any>) => {
    const pairs = _.chunk(args.toJSON(), 2);
    pairs.forEach(([id, value]) => {
      if (!(id instanceof Identifier)) {
        throw new Error('Argument name should be identifier');
      }
      return env.bind(id.name, evalExpr(value, env));
    });
  });

  nativeForms.set('quote', (env: Env) => (args: List<any>) => args.head);

  nativeForms.set('lambda', (env: Env) => (args: List<any>) => {
    return new Lambda(args.head, args.tail, env);
  });

  nativeForms.set('macro', (env: Env) => (args: List<any>) => {
    return new Macro(args.head, args.tail);
  });

  nativeForms.set('expand', (env: Env) => (args: List<any>) => {
    const macro = evalExpr(args.head, env);
    if (!(macro instanceof Macro)) {
      throw new Error(`Form "expand" requires first argument to be a Macro`);
    }
    return macro.expand(args.tail);
  });

  nativeForms.set('cond', (env: Env) => (args: List<any>) => {
    const pairs = _.chunk(args.toJSON(), 2);

    for (const pair of pairs) {
      if (pair.length === 1) {
        return evalExpr(_.head(pair), env);
      }

      if (evalExpr(_.head(pair), env)) {
        return evalExpr(_.last(pair), env);
      }
    }

    return undefined;
  });

  nativeForms.set('eval', (env: Env) => (args: List<any>) => {
    return evalExpr(args.head, env);
  });

  nativeForms.set('eval-in', (env: Env) => (args: List<any>) => {
    const l = evalExpr(args.head, env);
    if (!(l instanceof Lambda)) {
      throw new Error(`First argument should be a lambda`);
    }
    return evalExpr(args.tail.head, l.env);
  });
};
