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

  public isEmpty(): boolean {
    return this.head === null && this.tail === null;
  }

  get length(): number {
    let length = 0;

    for (let head: List<T> = this; head != null; head = head.tail) {
      length += 1;
    }

    return length;
  }

  public toString(): string {
    if (this.isEmpty()) {
      return 'Nil';
    }

    const values = [];

    for (let head: List<T> = this; head != null; head = head.tail) {
      values.push(String(head));
    }

    return `(${values.join(' ')})`;
  }
}

export const Nil = new List<any>(null, null);
