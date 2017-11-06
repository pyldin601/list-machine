import Env from '../Env';
import toPrimitive from "../printer";

export default class Lambda {
  constructor(
    public args: any[],
    public body: any[],
    public env: Env,
  ) {}

  public toString() {
    return toPrimitive(this);
  }
}
