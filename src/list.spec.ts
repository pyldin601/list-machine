import parseLexemes, { CLOSE_PARENTHESIS, OPEN_PARENTHESIS } from './lexeme';
import parseList from './list';

test('Parse empty program', () => {
  const result = parseList(parseLexemes(''));
  expect(result).toEqual([]);
});

test('Parse empty list', () => {
  const result = parseList(parseLexemes('()'));
  expect(result).toEqual([[]]);
});

test('Parse list of numbers', () => {
  const result = parseLexemes('(1 2 3)');
  expect(result).toEqual([
    [
      '1',
      '2',
      '3',
    ],
  ]);
});

test('Parse nested lists', () => {
  const result = parseList(parseLexemes('(1 (2 3 4) 5)'));
  expect(result).toEqual([
    [
      '1',
      [
        '2',
        '3',
        '4',
      ],
      '5',
    ],
  ]);
});

test('Parse multiple lists', () => {
  const result = parseList(parseLexemes('(1 2 3) (4 5)'));
  expect(result).toEqual([
    ['1', '2', '3'],
    ['4', '5'],
  ]);
});
