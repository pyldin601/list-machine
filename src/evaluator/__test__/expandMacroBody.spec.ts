import { get } from 'lodash';
import { parse } from '../../parser';
import expandExpression from '../expandMacroBody';

const expand = (code: string, args: any) => expandExpression(get(parse(code), 'body.0'), args);

test('Eval empty arguments', () => {
  expect(expand('()', {})).toEqual({ body: [], type: "ListExpression" });
});

test('Simple expressions', () => {
  expect(expand('a', { a: 10, b: 20 })).toEqual(10);

  expect(expand('(a b)', { a: 10, b: 20 })).toEqual({
    body: [10, 20],
    type: "ListExpression",
  });
});

test('Expand array with spread', () => {
  expect(expand('(a ...b)', { a: 1, b: [2, 3, 4] })).toEqual({
    body: [1, 2, 3, 4],
    type: "ListExpression",
  });
});

test('Expand compose expression with spread', () => {
  const args = {
    a: 1,
    b: {
      body: [10, 20],
      type: "ListExpression",
    },
  };

  expect(expand('(a ...b)', args)).toEqual({
    body: [
      1,
      {
        body: [10, 20],
        type: "ListExpression",
      },
    ],
    type: "ListExpression",
  });
});
