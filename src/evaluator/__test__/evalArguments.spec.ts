import { get } from 'lodash';
import { parse } from '../../parser';
import { IIdentifierNode } from '../../parser/types';
import evalArguments from '../evalArguments';

const evalFn = (node: IIdentifierNode) => [node.name];

const evalArgs = (code: string) => evalArguments(get(parse(code), 'body.0.body'), evalFn);

test('Eval empty arguments', () => {
  expect(evalArgs('()')).toEqual([]);
});

test('Eval one argument', () => {
  expect(evalArgs('(a)')).toEqual([['a']]);
});

test('Eval few arguments', () => {
  expect(evalArgs('(a b c)')).toEqual([['a'], ['b'], ['c']]);
});

test('Eval with spread', () => {
  expect(evalArgs('(a ...b c)')).toEqual([['a'], 'b', ['c']]);
  expect(evalArgs('(a ...b ...c)')).toEqual([['a'], 'b', 'c']);
});
