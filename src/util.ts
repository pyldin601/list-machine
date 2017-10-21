import { isEmpty, isString } from 'lodash';

export const isList = (exp: any): boolean => Array.isArray(exp);
export const isEmptyList = (exp: any): boolean => isList(exp) && isEmpty(exp);
export const isSymbol = (exp: any): boolean => isString(exp);