import { toArray } from 'lodash';
import { tokenize } from '../';

const readTokens = (code: string) => toArray(tokenize(code));

test('Tokenize empty string', () => {
  expect(readTokens('')).toEqual([]);
});

test('Read string', () => {
  expect(readTokens(' ')).toEqual([{
    position: { column: 1, line: 1 },
    type: 'Punctuator',
    value: 'Space',
  }]);
});

test('Read parens', () => {
  expect(readTokens('()')).toEqual([
    {
      position: { column: 1, line: 1 },
      type: "Punctuator",
      value: "LeftParen",
    },
    {
      position: { column: 2, line: 1 },
      type: "Punctuator",
      value: "RightParen",
    },
  ]);
});

test('Read brackets', () => {
  expect(readTokens('[]')).toEqual([
    {
      position: { column: 1, line: 1 },
      type: "Punctuator",
      value: "LeftBracket",
    },
    {
      position: { column: 2, line: 1 },
      type: "Punctuator",
      value: "RightBracket",
    },
  ]);
});

test('Read identifier', () => {
  expect(readTokens('foo')).toEqual([
    {
      position: { line: 1, column: 1, },
      type: 'Id',
      value: 'foo',
    },
  ]);
});

test('Read number', () => {
  expect(readTokens('12 3.14 1e-11 -22')).toEqual([
    {
      position: { line: 1, column: 1, },
      type: 'Number',
      value: '12',
    },
    {
      position: { line: 1, column: 3, },
      type: 'Punctuator',
      value: 'Space',
    },
    {
      position: { line: 1, column: 4, },
      type: 'Number',
      value: '3.14',
    },
    {
      position: { line: 1, column: 8, },
      type: 'Punctuator',
      value: 'Space',
    },
    {
      position: { line: 1, column: 9, },
      type: 'Number',
      value: '1e-11',
    },
    {
      position: { line: 1, column: 14, },
      type: 'Punctuator',
      value: 'Space',
    },
    {
      position: { line: 1, column: 15, },
      type: 'Number',
      value: '-22',
    },
  ])
});

test('Read boolean', () => {
  expect(readTokens('false true')).toEqual([
    {
      position: { line: 1, column: 1, },
      type: 'Boolean',
      value: 'false',
    },
    {
      position: { line: 1, column: 6, },
      type: 'Punctuator',
      value: 'Space',
    },
    {
      position: { line: 1, column: 7, },
      type: 'Boolean',
      value: 'true',
    },
  ]);
});

test('Read comment', () => {
  expect(readTokens('foo;Hello, World!')).toEqual([
    {
      position: { line: 1, column: 1 },
      type: 'Id',
      value: 'foo',
    },
    {
      position: { line: 1, column: 4 },
      type: 'Comment',
      value: 'Hello, World!',
    }
  ]);
});

test('Read string', () => {
  expect(readTokens('"Hello World!" "\\""')).toEqual([
    {
      position: { column: 1, line: 1 },
      type: "String",
      value: "Hello World!",
    },
    {
      position: { column: 15, line: 1 },
      type: "Punctuator",
      value: "Space",
    },
    {
      position: { column: 16, line: 1 },
      type: "String",
      value: "\"",
    }
  ]);
});

test('Read regular expression', () => {
  expect(readTokens('/\\d+/')).toEqual([
    {
      position: { column: 1, line: 1 },
      type: "RegExp",
      value: "/\\d+/",
    },
  ]);
});

test('Read undefined', () => {
  expect(readTokens('undefined')).toEqual([
    {
      position: { line: 1, column: 1 },
      type: 'Undefined',
      value: 'undefined',
    }
  ]);
});

test('Read null', () => {
  expect(readTokens('null')).toEqual([
    {
      position: { line: 1, column: 1 },
      type: 'Null',
      value: 'null',
    }
  ]);
});

test('Read unterminated string', () => {
  expect(() => readTokens('"foo')).toThrow();
});

test('Read unterminated string escape', () => {
  expect(() => readTokens('"foo\\')).toThrow();
});

test('Read sprest expression', () => {
  expect(readTokens('...')).toEqual([{
    position: { column: 1, line: 1 },
    type: 'Punctuator',
    value: '...',
  }]);

  expect(readTokens('... foo')).toEqual([
    {
      position: { column: 1, line: 1 },
      type: 'Punctuator',
      value: '...',
    },
    {
      position: { column: 4, line: 1 },
      type: 'Punctuator',
      value: 'Space',
    },
    {
      position: { column: 5, line: 1 },
      type: 'Id',
      value: 'foo',
    },
  ]);

  expect(readTokens('...foo')).toEqual([
    {
      position: { column: 1, line: 1 },
      type: 'Punctuator',
      value: '...',
    },
    {
      position: { column: 4, line: 1 },
      type: 'Id',
      value: 'foo',
    },
  ]);

  expect(() => readTokens('a.b')).toThrow('Incorrect identifier name');
});
