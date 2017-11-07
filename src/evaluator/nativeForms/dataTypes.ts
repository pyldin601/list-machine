import Env from '../../Env';
import { List } from '../../types';
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
};
