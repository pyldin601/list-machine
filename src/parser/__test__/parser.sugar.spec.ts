import { parseCode } from '../';

test('Parse apostrophe sugar with expression', () => {
  expect(parseCode("'()\n'foo")).toEqual({
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
          raw: 'foo',
          type: 'Id',
        },
      },
    ],
    type: 'RootExpression',
  });
});

test('Apostrophe EOF fail', () => {
  expect(() => parseCode("'")).toThrow();
});
