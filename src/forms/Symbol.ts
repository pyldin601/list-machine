import { IForm } from './';

export default class Symbol implements IForm {
  public value: any;

  constructor(value: string) {
    this.value = value;
  }
}
