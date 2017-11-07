import * as _ from 'lodash';
import Env from '../../Env';
import { IExpressionNode, NodeType } from '../../parser/types';
import { Lambda, Macro } from '../../types';
import evaluate from '../evaluate';
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
};
