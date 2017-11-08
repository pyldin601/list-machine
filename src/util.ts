import { last } from 'lodash';

export const arraySplitBy = <T> (array: T[], predicate: (item: T) => boolean): T[][] => {
  const result: T[][] = [[]];
  array.forEach(item => {
    if (predicate(item)) {
      result.push([]);
      return;
    }
    last(result).push(item);
  });
  return result;
};
