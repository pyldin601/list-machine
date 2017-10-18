import { IForm } from './';

export default class Macro implements IForm {
  public params: any[];
  public body: any[];

  constructor(params: any[], body: any) {
    this.params = params;
    this.body = body;
  }
}
