import { parse } from '../';

test('Parse empty expression', () => {
  expect(parse('')).toEqual({
    body: [],
    type: 'RootExpression',
  });
});

test('Parse root expression', () => {
  expect(parse('a b c d')).toEqual({
    body: [
      {
        body: [
          {
            name: 'a',
            type: 'Id',
          },
          {
            name: 'b',
            type: 'Id',
          },
          {
            name: 'c',
            type: 'Id',
          },
          {
            name: 'd',
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
  expect(parse('(a b)')).toEqual({
    body: [
      {
        body: [
          {
            name: 'a',
            type: 'Id',
          },
          {
            name: 'b',
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
  expect(parse('[a b]')).toEqual({
    body: [
      {
        body: [
          {
            body: [
              {
                name: 'a',
                type: 'Id',
              },
              {
                name: 'b',
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
  expect(parse('(12 3.14 1e-11 -22)')).toEqual({
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

test('Parse sprest expression', () => {
  expect(parse('...foo')).toEqual({
      body: [
        {
          body: [
            {
              type: 'SprestExpression',
              value: {
                name: 'foo',
                type: 'Id',
              },
            },
          ],
          type: 'ListExpression',
        }
      ],
      type: 'RootExpression'
    }
  );
});
