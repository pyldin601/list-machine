import toPrimitive from '../printer';

export default class LMSymbol {
  public value: string;

  constructor(value: string) {
    this.value = value;
  }

  public toString() {
    return toPrimitive(this);
  }
}
