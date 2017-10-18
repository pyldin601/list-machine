import Env from '../env';
import { IForm } from './';

export default class Macro implements IForm {
  public params: any[];
  public body: any[];
  public env: Env;

  constructor(params: any[], body: any, env?: Env) {
    this.params = params;
    this.body = body;
    this.env = env;
  }
}
