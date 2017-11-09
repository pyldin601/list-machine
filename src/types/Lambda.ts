import combineArguments from '../evaluator/combineArguments';
import Env from '../evaluator/Env';
import evalArguments from '../evaluator/evalArguments';
import evaluate from '../evaluator/evaluate';
import { List } from '../types';

export default class Lambda {
  constructor(readonly args: any[], readonly body: List<any>, readonly env: Env) { }

  public evaluate(args: List<any>, env: Env): any {
    const evaluatedArgs = evalArguments(args, env);
    const packedArgs = combineArguments(this.args, evaluatedArgs);
    const newEnv = this.env.newEnv(packedArgs);
    return evaluate(this.body, newEnv);
  }
}
