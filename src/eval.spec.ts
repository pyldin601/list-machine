import evalString from './eval';

const expectEval = (program: string) => expect(evalString(program));

test('Eval empty program', () => {
  expectEval('').toBeNull();
});

test('Eval sum without args', () => {
  expectEval('(+)').toBe(0);
});

test('Eval sum of one number', () => {
  expectEval('(+ 1)').toBe(1);
});

test('Eval sum of two numbers', () => {
  expectEval(`(+ 1 1)`).toBe(2);
});

test('Eval sum of three numbers', () => {
  expectEval(`(+ 1 2 3)`).toBe(6);
});

test('Eval nested sums', () => {
  expectEval(`(+ 1 2 (+ 3 4))`).toBe(10);
});

test('Return self if nothing to eval', () => {
  expectEval('+').toBe('+');
});

test('Test binding support', () => {
  expectEval('(def a 4) (+ a 2 3)').toBe(9);
});

test('Test lambda #1', () => {
  expectEval(`
    (def pi 3.14)
    (def circumference (lambda (r) (* 2 pi r)))
    (circumference 2)
  `).toBe(12.56);
});

test('Test lambda #2', () => {
  expectEval(`
    (def square (lambda (x) (* x x)))
    (def sum-of-squares (lambda (x y) (+ (square x) (square y))))
    (sum-of-squares 3 2)
  `).toBe(13);
});
