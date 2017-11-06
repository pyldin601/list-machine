import toPrimitive from '../printer';

export default class LMSymbol {
  constructor(public value: string) {}

  public toString() {
    return toPrimitive(this);
  }
}
