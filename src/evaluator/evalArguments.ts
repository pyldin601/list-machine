import { INode, NodeType } from '../parser/types';

export default (args: INode[], evalFn: (node: INode) => any): any[] => {
  return args.reduce((evaluateArgs: any[], arg: INode) => {
    if (arg.type === NodeType.SPREST_EXPRESSION) {
      return evaluateArgs.concat(evalFn(arg.value));
    }

    return [...evaluateArgs, evalFn(arg)];
  }, []);
};
