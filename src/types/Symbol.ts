import toPrimitive from '../printer';

export default class Symbol {
  public value: string;

  constructor(value: string) {
    this.value = value;
  }

  public toString() {
    return toPrimitive(this);
  }
}
