import parse from '../parser';
import { readFromString } from '../reader';
import { tokenize } from '../tokenizer';

const parseCode = (code: string) => parse(tokenize(readFromString(code)));

test('Parse apostrophe sugar with expression', () => {
  expect(parseCode("'() 'foo")).toEqual({
    body: [
      {
        type: 'QuoteExpression',
        value: {
          body: [],
          type: 'ListExpression',
        },
      },
      {
        type: "QuoteExpression",
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
