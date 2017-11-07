import Env from '../Env';
import combineArguments from '../evaluator/combineArguments';
import evalArguments from '../evaluator/evalArguments';
import evaluate from '../evaluator/evaluate';
import { IExpressionNode } from '../parser/types';

export default class Lambda {
  constructor(readonly args: IExpressionNode, readonly body: IExpressionNode, readonly env: Env) { }

  public evaluate(args: any[], env: Env): any {
    const evaluatedArgs = evalArguments(args, env);
    const packedArgs = combineArguments(this.args, evaluatedArgs);
    const newEnv = this.env.newEnv(packedArgs);
    return evaluate(this.body, newEnv);
  }
}
