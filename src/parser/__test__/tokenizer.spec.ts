import { toArray } from 'lodash';
import { tokenize } from '../';

const readTokens = (code: string) => toArray(tokenize(code));

test('Tokenize empty string', () => {
  expect(readTokens('')).toEqual([]);
});

test('Read string', () => {
  expect(readTokens(' ')).toEqual([{
    type: 'Punctuator',
    value: 'Space',
  }]);
});

test('Read parens', () => {
  expect(readTokens('()')).toEqual([
    {
      type: "Punctuator",
      value: "LeftParen",
    },
    {
      type: "Punctuator",
      value: "RightParen",
    },
  ]);
});

test('Read brackets', () => {
  expect(readTokens('[]')).toEqual([
    {
      type: "Punctuator",
      value: "LeftBracket",
    },
    {
      type: "Punctuator",
      value: "RightBracket",
    },
  ]);
});

test('Read identifier', () => {
  expect(readTokens('foo')).toEqual([
    {
      type: 'Id',
      value: 'foo',
    },
  ]);
});

test('Read number', () => {
  expect(readTokens('12 3.14 1e-11 -22')).toEqual([
    {
      type: 'Number',
      value: '12',
    },
    {
      type: 'Punctuator',
      value: 'Space',
    },
    {
      type: 'Number',
      value: '3.14',
    },
    {
      type: 'Punctuator',
      value: 'Space',
    },
    {
      type: 'Number',
      value: '1e-11',
    },
    {
      type: 'Punctuator',
      value: 'Space',
    },
    {
      type: 'Number',
      value: '-22',
    },
  ])
});

test('Read boolean', () => {
  expect(readTokens('false true')).toEqual([
    {
      type: 'Boolean',
      value: 'false',
    },
    {
      type: 'Punctuator',
      value: 'Space',
    },
    {
      type: 'Boolean',
      value: 'true',
    },
  ]);
});

test('Read comment', () => {
  expect(readTokens('foo;Hello, World!')).toEqual([
    {
      type: 'Id',
      value: 'foo',
    },
    {
      type: 'Comment',
      value: 'Hello, World!',
    }
  ]);
});

test('Read string', () => {
  expect(readTokens('"Hello World!" "\\""')).toEqual([
    {
      type: "String",
      value: "Hello World!",
    },
    {
      type: "Punctuator",
      value: "Space",
    },
    {
      type: "String",
      value: "\"",
    }
  ]);
});

test('Read regular expression', () => {
  expect(readTokens('/\\d+/')).toEqual([
    {
      type: "RegExp",
      value: "/\\d+/",
    },
  ]);
});

test('Read undefined', () => {
  expect(readTokens('undefined')).toEqual([
    {
      type: 'Undefined',
      value: 'undefined',
    }
  ]);
});

test('Read null', () => {
  expect(readTokens('null')).toEqual([
    {
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
    type: 'Punctuator',
    value: 'Sprest',
  }]);

  expect(readTokens('... foo')).toEqual([
    {
      type: 'Punctuator',
      value: 'Sprest',
    },
    {
      type: 'Punctuator',
      value: 'Space',
    },
    {
      type: 'Id',
      value: 'foo',
    },
  ]);

  expect(readTokens('...foo')).toEqual([
    {
      type: 'Punctuator',
      value: 'Sprest',
    },
    {
      type: 'Id',
      value: 'foo',
    },
  ]);

  expect(() => readTokens('a.b')).toThrow('Incorrect identifier name');
});
