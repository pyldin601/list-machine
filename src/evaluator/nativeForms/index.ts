import Env from '../Env';
import loadBinaryOperators from './binaryOperators';
import loadDataTypes from './dataTypes';
import loadSpecialForms from './specialForms';

export type NativeForm = (env: Env) => any;
export const nativeForms = new Map<string, NativeForm>();

loadBinaryOperators();
loadDataTypes();
loadSpecialForms();

export const isNativeForm = (name: string): boolean => nativeForms.has(name);
export const getNativeForm = (name: string): NativeForm => nativeForms.get(name);

