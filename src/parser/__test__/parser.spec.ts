import { parseCode } from '../';

test('Parse empty expression', () => {
  expect(parseCode('')).toEqual({
    body: [],
    type: 'RootExpression',
  });
});

test('Parse root expression', () => {
  expect(parseCode('a b c d')).toEqual({
    body: [
      {
        body: [
          {
            name: 'a',
            raw: 'a',
            type: 'Id',
          },
          {
            name: 'b',
            raw: 'b',
            type: 'Id',
          },
          {
            name: 'c',
            raw: 'c',
            type: 'Id',
          },
          {
            name: 'd',
            raw: 'd',
            type: 'Id',
          },
        ],
        type: 'ListExpression',
      }
    ],
    type: 'RootExpression',
  });
});

test('Parse list expression', () => {
  expect(parseCode('(a b)')).toEqual({
    body: [
      {
        body: [
          {
            name: 'a',
            raw: 'a',
            type: 'Id',
          },
          {
            name: 'b',
            raw: 'b',
            type: 'Id',
          },
        ],
        type: 'ListExpression',
      }
    ],
    type: 'RootExpression',
  });
});

test('Parse brackets expression', () => {
  expect(parseCode('[a b]')).toEqual({
    body: [
      {
        body: [
          {
            body: [
              {
                name: 'a',
                raw: 'a',
                type: 'Id',
              },
              {
                name: 'b',
                raw: 'b',
                type: 'Id',
              },
            ],
            type: 'BracketExpression',
          }
        ],
        type: 'ListExpression',
      }
    ],
    type: 'RootExpression',
  });
});

test('Parse list of numbers', () => {
  expect(parseCode('(12 3.14 1e-11 -22)')).toEqual({
      body: [
        {
          body: [
            {
              raw: "12",
              type: "Literal",
              value: 12,
            },
            {
              raw: "3.14",
              type: "Literal",
              value: 3.14,
            },
            {
              raw: "1e-11",
              type: "Literal",
              value: 1e-11
            },
            {
              raw: "-22",
              type: "Literal",
              value: -22,
            },
          ],
          type: "ListExpression",
        }
      ],
      type: "RootExpression"
    }
  );
});
