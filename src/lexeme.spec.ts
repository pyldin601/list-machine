import parseLexemes, { CLOSE_PARENTHESIS, OPEN_PARENTHESIS, APOSTROPHE } from './lexeme';

test('Parse empty program', () => {
  const result = parseLexemes('');
  expect(result).toEqual([]);
});

test('Parse empty list', () => {
  const result = parseLexemes('()');
  expect(result).toEqual([OPEN_PARENTHESIS, CLOSE_PARENTHESIS]);
});

test('Parse list of numbers', () => {
  const result = parseLexemes('(1 2 3)');
  expect(result).toEqual([
    OPEN_PARENTHESIS,
    '1',
    '2',
    '3',
    CLOSE_PARENTHESIS,
  ]);
});

test('Parse nested lists', () => {
  const result = parseLexemes('(1 (2 3 4) 5)');
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

  expect(() => parseLexemes('(')).toThrowError(errorMessage);
  expect(() => parseLexemes(')')).toThrowError(errorMessage);
  expect(() => parseLexemes('())')).toThrowError(errorMessage);
  expect(() => parseLexemes('(()')).toThrowError(errorMessage);
});

test('Test quote', () => {
  expect(parseLexemes(`'(1 2 3)`)).toEqual([
    APOSTROPHE,
    OPEN_PARENTHESIS,
    '1',
    '2',
    '3',
    CLOSE_PARENTHESIS,
  ]);
});
