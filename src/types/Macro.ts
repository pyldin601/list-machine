import toPrimitive from "../printer";

export default class Lambda {
  public args: any[];
  public body: any[];

  constructor(args: any[], body: any[]) {
    this.args = args;
    this.body = body;
  }

  public toString() {
    return toPrimitive(this);
  }
}
