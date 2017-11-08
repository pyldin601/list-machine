import Env from "../evaluator/Env";
import combineArguments from "../evaluator/combineArguments";
import evaluate from '../evaluator/evaluate';
import expandMacro from "../evaluator/expandMacro";

export default class Macro {
  constructor(readonly args: any, readonly body: any) { }

  public evaluate(args: any[], env: Env): any {
    const newBody = this.expand(args);
    return evaluate(newBody, env);
  }

  public expand(args: any[]): any {
    const packedArgs = combineArguments(this.args, args);
    return expandMacro(this.body, packedArgs);
  }
}
