import evalString from './eval';

const expectEval = (program: string) => expect(evalString(program));

test('Eval empty program', () => {
  expectEval('').toBeNull();
});

test('Eval sum without args', () => {
  expectEval('(OP_ADD)').toBe(0);
});

test('Eval sum of one number', () => {
  expectEval('(OP_ADD 1)').toBe(1);
});

test('Eval sum of two numbers', () => {
  expectEval(`(OP_ADD 1 1)`).toBe(2);
});

test('Eval sum of three numbers', () => {
  expectEval(`(OP_ADD 1 2 3)`).toBe(6);
});

test('Eval nested sums', () => {
  expectEval(`(OP_ADD 1 2 (OP_ADD 3 4))`).toBe(10);
});

test('Return self if nothing to eval', () => {
  expectEval('OP_ADD').toBe('OP_ADD');
});

test('Test binding support', () => {
  expectEval('(def + OP_ADD) (+ 2 3)').toBe(5);
});
