export default class List<T> {
  public static Nil = new List<any>(undefined, undefined);

  public static of<T>(...items: T[]): List<T> {
    return items
      .reverse()
      .reduce((acc, item) => acc.prepend(item), List.Nil);
  }

  constructor(readonly head: T | undefined, readonly tail: List<T> | undefined) {
  }

  public prepend(item: T): List<T> {
    return new List(item, this);
  }

  public append(item: T): List<T> {
    return this.reverse().prepend(item).reverse();
  }

  public concat(list: List<T>): List<T> {
    let lst = list;

    for (let node: List<T> = this.reverse(); !node.isLast(); node = node.tail) {
      lst = lst.prepend(node.head);
    }

    return lst;
  }

  public isEmpty(): boolean {
    return this.head === undefined && this.tail === undefined;
  }

  public isLast(): boolean {
    return this.tail === undefined;
  }

  get length(): number {
    let length = 0;

    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      length += 1;
    }

    return length;
  }

  public toString(): string {
    if (this.isEmpty()) {
      return 'Nil';
    }

    const values = [];

    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      values.push(String(node.head));
    }

    return `(${values.join(' ')})`;
  }

  public toJSON(): T[] {
    const arr = [];

    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      arr.push(node.head);
    }

    return arr;
  }

  public reduce<R>(reducer: (acc: R, item: T) => R, initial: R): R {
    let acc = initial;

    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      acc = reducer(acc, node.head);
    }

    return acc;
  }

  public map<R>(mapper: (item: T) => R): List<R> {
    let list = List.Nil;

    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      list = list.prepend(mapper(node.head));
    }

    return list.reverse();
  }

  public every(predicate: (item: T) => boolean): boolean {
    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      if (!predicate(node.head)) {
        return false;
      }
    }

    return true;
  }

  public filter(filter: (item: T) => boolean): List<T> {
    let list = List.Nil;

    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      if (filter(node.head)) {
        list = list.prepend(node.head);
      }
    }

    return list.reverse();
  }

  public reverse(): List<T> {
    let list = List.Nil;

    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      list = list.prepend(node.head);
    }

    return list;
  }

  public join(separator?: string): string {
    let acc = '';

    for (let node: List<T> = this; !node.isLast(); node = node.tail) {
      if (node !== this) {
        acc = `${acc}${separator}`;
      }

      acc = `${acc}${node.head}`;
    }

    return acc;
  }
}
