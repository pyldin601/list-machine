import parseLexemes from './lexeme';
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
  const result = parseList(parseLexemes('(1 2 3)'));
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

test('Parse big program', () => {
  const program = `
    (def fibonacci (n)
      (cond
        ((eq n 1) 0)
        ((eq n 2) 1)
        ((+ (fibonacci (- n 1)) (fibonacci (- n 2))))))
    
    (fibonacci 5)
  `;

  const result = parseList(parseLexemes(program));
  expect(result).toEqual([
    ['def', 'fibonacci', ['n'],
      ['cond',
        [['eq', 'n', '1'], '0'],
        [['eq', 'n', '2'], '1'],
        [['+', ['fibonacci', ['-', 'n', '1']], ['fibonacci', ['-', 'n', '2']]]]]],
    ['fibonacci', '5'],
  ]);
});

test('Parse quote', () => {
  const result = parseList(parseLexemes(`'(1 2 3)`));
  expect(result).toEqual([
    ['quote', ['1', '2', '3']],
  ]);
});
