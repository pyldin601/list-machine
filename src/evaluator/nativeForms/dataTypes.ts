import { List } from '../../types';
import Env from '../Env';
import evalArguments from '../evalArguments';
import { evalExpr } from '../evaluate';
import { nativeForms } from './';

export default () => {
  nativeForms.set('list', (env: Env) => (items: List<any>) => {
    return evalArguments(items, env);
  });

  nativeForms.set('cons', (env: Env) => (args: List<any>) => {
    const evaluatedItem = evalExpr(args.head, env);
    const evaluatedList = evalExpr(args.tail.head, env);

    if (!(evaluatedList instanceof List)) {
      throw new Error('Second argument should be a list');
    }

    return evaluatedList.prepend(evaluatedItem);
  });

  nativeForms.set('car', (env: Env) => (args: List<any>) => {
    const evaluatedList = evalExpr(args.head, env);
    if (!(evaluatedList instanceof List)) {
      throw new Error('Argument should be a list');
    }
    return evaluatedList.head;
  });

  nativeForms.set('cdr', (env: Env) => (args: List<any>) => {
    const evaluatedList = evalExpr(args.head, env);
    if (!(evaluatedList instanceof List)) {
      throw new Error('Argument should be a list');
    }
    return evaluatedList.tail;
  });

  nativeForms.set('Nil', (env: Env) => List.Nil);

  nativeForms.set('new', (env: Env) => (args: List<any>): any => {
    const Obj = evalExpr(args.head, env);
    const evaluatedArgs = evalArguments(args.tail, env);
    return new Obj(...evaluatedArgs.toJSON());
  });

  nativeForms.set('get-attr', (env: Env) => (args: List<any>): any => {
    return evalExpr(args.head, env)[evalExpr(args.tail.head, env)];
  });

  nativeForms.set('set-attr!', (env: Env) => (args: List<any>) => {
    evalExpr(args.head, env)[evalExpr(args.tail.head, env)] = evalExpr(args.tail.tail.head, env);
  });

  nativeForms.set('del-attr!', (env: Env) => (args: List<any>) => {
    delete evalExpr(args.head, env)[evalExpr(args.tail.head, env)];
  });

  nativeForms.set('has-attr', (env: Env) => (args: List<any>) => {
    return evalExpr(args.tail.head, env) in evalExpr(args.head, env);
  });
};
