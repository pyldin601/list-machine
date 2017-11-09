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

  public toJSON(): T[] {
    const arr = [];

    for (let node: List<T> = this; node.tail !== null; node = node.tail) {
      arr.push(node.head);
    }

    return arr;
  }

  public reduce<R>(reducer: (acc: R, item: T) => R, initial: R): R {
    const acc = initial;

    for (let node: List<T> = this; node.tail !== null; node = node.tail) {
      acc = reducer(acc, node.head);
    }

    return acc;
  }

  public map<R>(mapper: (item: T) => R): List<R> {
    const list = Nil;

    for (let node: List<T> = this; node.tail !== null; node = node.tail) {
      list = list.prepend(mapper(node.head));
    }

    return list.reverse();
  }

  public filter(filter: (item: T) => boolean): List<T> {
    const list = Nil;

    for (let node: List<T> = this; node.tail !== null; node = node.tail) {
      if (filter(node.head)) {
        list = list.prepend(node.head);
      }
    }

    return list.reverse();
  }

  public reverse(): List<T> {
    const list = Nil;

    for (let node: List<T> = this; node.tail !== null; node = node.tail) {
      list = list.prepend(node.head);
    }

    return list;
  }
}

export const Nil = new List<any>(null, null);
