import * as _ from 'lodash';

export default class List<T> {
  public static of<T>(...items: T[]): List<T> {
    if (_.isEmpty(items)) {
      return Nil;
    }

    return new List<T>(_.head(items), List.of<T>(..._.tail(items)));
  }

  constructor(readonly head: T | null, readonly tail: List<T> | null) {
  }

  public prepend(item: T): List<T> {
    return new List(item, this);
  }

  public isEmpty(): boolean {
    return this.head === null && this.tail === null;
  }

  get length(): number {
    let length = 0;

    for (let node: List<T> = this; node.tail != null; node = node.tail) {
      length += 1;
    }

    return length;
  }

  public toString(): string {
    if (this.isEmpty()) {
      return 'Nil';
    }

    const values = [];

    for (let node: List<T> = this; node.tail !== null; node = node.tail) {
      values.push(String(node.head));
    }

    return `(${values.join(' ')})`;
  }
}

export const Nil = new List<any>(null, null);
