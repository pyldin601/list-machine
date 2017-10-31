import { isEmpty, isString, last } from 'lodash';

export const isList = (exp: any): boolean => Array.isArray(exp);
export const isEmptyList = (exp: any): boolean => isList(exp) && isEmpty(exp);
export const isSymbol = (exp: any): boolean => isString(exp);

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
