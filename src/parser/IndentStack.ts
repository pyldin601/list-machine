import * as _ from 'lodash';

export default class IndentStack {
  private stack: number[] = [];

  public proceed(indent: number): this {
    const size = _.sum(this.stack);

    if (indent === size) {
      return this;
    }

    if (indent > size) {
      this.stack.push(indent - size);
    }

    this.subtractIndent(size - indent);

    return this;
  }

  public size(): number {
    return _.size(this.stack);
  }

  private subtractIndent(amount: number) {
    if (amount === 0) {
      return;
    }

    const lastIndent = _.last(this.stack);

    if (lastIndent > amount) {
      this.stack.pop();
      return;
    }

    this.subtractIndent(amount - lastIndent);
  }
}
