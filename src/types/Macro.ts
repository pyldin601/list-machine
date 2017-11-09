import combineArguments from "../evaluator/combineArguments";
import Env from "../evaluator/Env";
import evaluate from '../evaluator/evaluate';
import expandMacro from "../evaluator/expandMacro";
import { List } from './';

export default class Macro {
  constructor(readonly args: any[], readonly body: List<any>) { }

  public evaluate(args: List<any>, env: Env): any {
    const newBody = this.expand(args);
    return evaluate(newBody, env);
  }

  public expand(args: List<any>): any {
    const packedArgs = combineArguments(this.args, args);
    return expandMacro(this.body, packedArgs);
  }
}
