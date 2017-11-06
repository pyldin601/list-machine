import toPrimitive from "../printer";

export default class Macro {
  constructor(public args: any, public body: any) {
  }

  public toString() {
    return toPrimitive(this);
  }
}
