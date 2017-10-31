import toList from './list';
import toPrimitive from './printer';
import parse from './tokens';

test('Parse empty program', () => {
  const result = toList(parse(''));
  expect(result).toEqual([]);
});

test('Parse empty list', () => {
  const result = toList(parse('()'));
  expect(result).toEqual([[]]);
});

test('Parse list of numbers', () => {
  const result = toList(parse('(1 2 3)'));
  expect(result).toEqual([
    [
      1,
      2,
      3,
    ],
  ]);
});

test('Parse nested lists', () => {
  const result = toList(parse('(1 (2 3 4) 5)'));
  expect(result).toEqual([
    [
      1,
      [
        2,
        3,
        4,
      ],
      5,
    ],
  ]);
});

test('Parse multiple lists', () => {
  const result = toList(parse('(1 2 3) (4 5)'));
  expect(result).toEqual([
    [1, 2, 3],
    [4, 5],
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

  const result = toList(parse(program)).map(toPrimitive);
  expect(result).toEqual([
    '(def fibonacci (n) (cond ((eq n 1) 0) ((eq n 2) 1) ((+ (fibonacci (- n 1)) (fibonacci (- n 2))))))',
    '(fibonacci 5)',
  ]);
});

test('Parse quote', () => {
  const result = toList(parse(`'(1 2 3)`)).map(toPrimitive);
  expect(result).toEqual([
    '(quote (1 2 3))',
  ]);
});
