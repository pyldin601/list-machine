import Env from './Env';
import { INode, NodeType } from '../parser/types';
import evaluate from './evaluate';

export default (args: INode[], env: Env): any[] => {
  return args.reduce((evaluateArgs: any[], arg: INode) => {
    if (arg.type === NodeType.SPREST_EXPRESSION) {
      return evaluateArgs.concat(evaluate(arg.value, env));
    }

    return [...evaluateArgs, evaluate(arg, env)];
  }, []);
};
