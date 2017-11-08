import * as _ from 'lodash';
import Env from '../Env';
import { List } from '../../types';
import { Nil } from '../../types/List';
import evalArguments from '../evalArguments';
import evaluate from '../evaluate';
import { nativeForms } from './';

export default () => {
  nativeForms.set('list', (env: Env) => (...items: any[]) => {
    const evaluatedArguments = evalArguments(items, env);
    return List.of(...evaluatedArguments);
  });

  nativeForms.set('cons', (env: Env) => (item: any, list: any) => {
    const evaluatedItem = evaluate(item, env);
    const evaluatedList = evaluate(list, env);

    if (!(evaluatedList instanceof List)) {
      throw new Error('Second argument should be a list');
    }

    return evaluatedList.prepend(evaluatedItem);
  });

  nativeForms.set('car', (env: Env) => (list: any) => {
    const evaluatedList = evaluate(list, env);
    if (!(evaluatedList instanceof List)) {
      throw new Error('Argument should be a list');
    }
    return evaluatedList.head;
  });

  nativeForms.set('cdr', (env: Env) => (list: any) => {
    const evaluatedList = evaluate(list, env);
    if (!(evaluatedList instanceof List)) {
      throw new Error('Argument should be a list');
    }
    return evaluatedList.tail;
  });

  nativeForms.set('Nil', (env: Env) => Nil);

  nativeForms.set('new', (env: Env) => (obj: any, ...ctorArgs: any[]): any => {
    const Obj = evaluate(_.head(obj), env);
    const evaluatedArgs = evalArguments(ctorArgs, env);
    return new Obj(...evaluatedArgs);
  });

  nativeForms.set('get-attr', (env: Env) => (obj: any, attr: any): any => {
    return evaluate(obj, env)[evaluate(attr, env)];
  });

  nativeForms.set('set-attr!', (env: Env) => (obj: any, attr: any, value: any) => {
    evaluate(obj, env)[evaluate(attr, env)] = evaluate(value, env);
  });

  nativeForms.set('del-attr!', (env: Env) => (obj: any, attr: any) => {
    delete evaluate(obj, env)[evaluate(attr, env)];
  });

  nativeForms.set('has-attr', (env: Env) => (obj: any, attr: any) => {
    return evaluate(attr, env) in evaluate(obj, env);
  });
};
