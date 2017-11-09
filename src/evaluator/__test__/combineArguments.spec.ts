import { get } from 'lodash';
import { parse } from '../../parser';
import { List } from '../../types';
import combineArguments from '../combineArguments';
import listify from '../listify';

const combine = (code: string, args: List<any>) =>
  combineArguments(get(listify(parse(code)), '0.head.0'), args);

test('Combine empty arguments', () => {
  expect(combine('[]', List.Nil)).toEqual({});
});

test('Combine one argument', () => {
  expect(combine('[a]', List.of(10))).toEqual({ a: 10 });
});

test('Combine one argument with many values', () => {
  expect(combine('[a]', List.of(10, 15, 20))).toEqual({ a: 10 });
});

test('Combine destructuring', () => {
  expect(combine('[[a b c]]', List.of(List.of(10, 15, 20)))).toEqual({ a: 10, b: 15, c: 20 });
});

test('Combine with rest argument', () => {
  expect(combine('[a ...b]', List.of(1, 2, 3))).toEqual({ a: 1, b: List.of(2, 3) });
  expect(combine('[a ...b]', List.of(1))).toEqual({ a: 1, b: List.Nil });
});

test('Complex combiner test', () => {
  expect(combine(
    '[a [b ...c] [d] [...e] ...f]',
    List.of(
      List.of(1, 2, 3),
      List.of(4, 5, 6),
      List.of(7, 8, 9),
      List.of(10, 11, 12),
      List.of(13, 14, 15),
    )
  ))
    .toEqual({
      a: List.of(1, 2, 3),
      b: 4,
      c: List.of(5, 6),
      d: 7,
      e: List.of(10, 11, 12),
      f: List.of(List.of(13, 14, 15)),
    });
});

test('Wrong arguments tests', () => {
  expect(() => combine('(foo)', List.Nil)).toThrow('Wrong type of argument list');
  expect(() => combine('[a ...b c]', List.of(1, 2, 3, 4, 5))).toThrow('Rest argument should be the last');
  expect(() => combine('[[a b c]]', List.of(1))).toThrow('Argument of type "number" could not be destructed');
  expect(() => combine('[(a)]', List.Nil)).toThrow('Wrong type of argument - object');
});
