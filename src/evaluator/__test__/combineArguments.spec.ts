import { get } from 'lodash';
import { parse } from '../../parser';
import combineArguments from '../combineArguments';

const combine = (code: string, args: any[]) => combineArguments(get(parse(code), 'body.0.body.0'), args);

test('Combine empty arguments', () => {
  expect(combine('[]', [])).toEqual({});
});

test('Combine one argument', () => {
  expect(combine('[a]', [10])).toEqual({ a: 10 });
});

test('Combine one argument with many values', () => {
  expect(combine('[a]', [10, 15, 20])).toEqual({ a: 10 });
});

test('Combine destructuring', () => {
  expect(combine('[[a b c]]', [[10, 15, 20]])).toEqual({ a: 10, b: 15, c: 20 });
});

test('Combine with rest argument', () => {
  expect(combine('[a ...b]', [1, 2, 3])).toEqual({ a: 1, b: [2, 3] });
});

test('Complex combiner test', () => {
  expect(combine('[a [b ...c] [d] [...e] ...f]', [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15]]))
    .toEqual({ a: [1, 2, 3], b: 4, c: [5, 6], d: 7, e: [10, 11, 12], f: [[13, 14, 15]] });
});

test('Wrong arguments tests', () => {
  expect(() => combine('(foo)', [])).toThrow('Argument list should be wrapped in to brackets');
  expect(() => combine('[a ...b c]', [])).toThrow('Rest argument should be the last');
  expect(() => combine('[[a b c]]', [1])).toThrow('Argument of type "number" can not be destructed');
  expect(() => combine('[(a)]', [])).toThrow('Wrong type of argument - ListExpression');
});
