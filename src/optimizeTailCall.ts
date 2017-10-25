import { isEmpty } from 'lodash';

export default <R> (f: (...args: any[]) => R): (...args: any[]) => R => {
  let underCall = false;
  const queue: any[][] = [];

  return (...args: any[]) => {
    let result;
    queue.push(args);

    if (!underCall) {
      underCall = true;
      while (!isEmpty(queue)) {
        result = f(...queue.shift());
      }
      underCall = false;
    }

    return result;
  };
};
