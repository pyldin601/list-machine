import { parse } from '../';

test('Parse apostrophe sugar with expression', () => {
  expect(parse("'()\n'foo")).toEqual({
    body: [
      {
        type: 'QuotedExpression',
        value: {
          body: [],
          type: 'ListExpression',
        },
      },
      {
        type: "QuotedExpression",
        value: {
          name: 'foo',
          type: 'Id',
        },
      },
    ],
    type: 'RootExpression',
  });
});

test('Apostrophe EOF fail', () => {
  expect(() => parse("'")).toThrow();
});
