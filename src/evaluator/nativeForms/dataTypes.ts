import * as _ from 'lodash';
import Env from '../../Env';
import { List } from '../../types';
import { Nil } from '../../types/List';
import evalArguments from '../evalArguments';
import evaluate from '../evaluate';
import { nativeForms } from './';

export default () => {
  nativeForms.set('cons', (env: Env) => (...args: any[]) => {
    const evaluatedArgs = evalArguments(args, env);
    return List.of(...evaluatedArgs);
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
};


// case ATTR_GET: {
//   const [object, attr] = evalArgs(args);
//   return object[attr];
// }
//
// case ATTR_SET: {
//   const [object, attr, value] = evalArgs(args);
//   object[attr] = value;
//   return undefined;
// }
//
// case ATTR_HAS: {
//   const [object, attr] = evalArgs(args);
//   return attr in object;
// }
//
// case ATTR_DEL: {
//   const [object, attr] = evalArgs(args);
//   delete object[attr];
//   return undefined;
// }
