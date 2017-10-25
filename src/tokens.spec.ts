import parse, { APOSTROPHE, CLOSE_PARENTHESIS, OPEN_PARENTHESIS } from './tokens';

test('Parse empty program', () => {
  const result = parse('');
  expect(result).toEqual([]);
});

test('Parse empty list', () => {
  const result = parse('()');
  expect(result).toEqual([OPEN_PARENTHESIS, CLOSE_PARENTHESIS]);
});

test('Parse list of numbers', () => {
  const result = parse('(1 2 3)');
  expect(result).toEqual([
    OPEN_PARENTHESIS,
    '1',
    '2',
    '3',
    CLOSE_PARENTHESIS,
  ]);
});

test('Parse nested lists', () => {
  const result = parse('(1 (2 3 4) 5)');
  expect(result).toEqual([
    OPEN_PARENTHESIS,
    '1',
    OPEN_PARENTHESIS,
    '2',
    '3',
    '4',
    CLOSE_PARENTHESIS,
    '5',
    CLOSE_PARENTHESIS,
  ]);
});

test('Parse incorrect list', () => {
  const errorMessage = 'Unbalanced parenthesis';

  expect(() => parse('(')).toThrowError(errorMessage);
  expect(() => parse(')')).toThrowError(errorMessage);
  expect(() => parse('())')).toThrowError(errorMessage);
  expect(() => parse('(()')).toThrowError(errorMessage);
});

test('Test quote', () => {
  expect(parse(`'(1 2 3)`)).toEqual([
    APOSTROPHE,
    OPEN_PARENTHESIS,
    '1',
    '2',
    '3',
    CLOSE_PARENTHESIS,
  ]);
});
