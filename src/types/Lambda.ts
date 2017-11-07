import Env from '../Env';

export default class Lambda {
  constructor(
    public args: any[],
    public body: any[],
    public env: Env,
  ) {}
}
