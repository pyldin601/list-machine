import evalString from './eval';
import toPrimitive from "./printer";

const expectEval = (program: string) => expect(toPrimitive(evalString(program)));

test('Eval empty program', () => {
  expectEval('').toBeUndefined();
});

test('Eval sum of one number', () => {
  expectEval('+ 1').toBe(1);
});

test('Eval sum of two numbers', () => {
  expectEval(`+ 1 1`).toBe(2);
});

test('Eval sum of three numbers', () => {
  expectEval(`+ 1 2 3`).toBe(6);
});

test('Eval nested sums', () => {
  expectEval(`+ 1 2 (+ 3 4)`).toBe(10);
});

test('Return self if nothing to eval', () => {
  expectEval('+').toBe('+');
});

test('Test binding support', () => {
  expectEval('def a 4\n+ a 2 3').toBe(9);
});

test('Test lambda #1', () => {
  expectEval(`
    def pi 3.14
    def circumference
      lambda (r) (* 2 pi r)
    circumference 2
  `).toBe(12.56);
});

test('Test lambda #2', () => {
  expectEval(`
    (def square (lambda (x) (* x x)))
    (def sum-of-squares (lambda (x y) (+ (square x) (square y))))
    (sum-of-squares 3 2)
  `).toBe(13);
});

test('Test macro #1', () => {
  expectEval(`
    (def defmacro (macro (name args body) (def name (macro args body))))
    (defmacro inc (n) (+ 1 n))
    (inc 4)
  `).toBe(5);
});

test('Test macro #2', () => {
  expectEval(`
    (def defun (macro (name args body) (def name (lambda args body))))
    (defun inc (n) (+ 1 n))
    (inc 4)
  `).toBe(5);
});

test('Test quote #1', () => {
  expectEval(`
    (quote (1 2 3))
  `).toBe('(1 2 3)');
});

test('Test cond and eq? #1', () => {
  expectEval(`
    (def fib 
      (lambda (n)
        (cond
          ((eq? 0 n) 0)
          ((eq? 1 n) 1)
          ((+ (fib (- n 2)) (fib (- n 1)))))))
    (fib 12)
  `).toBe(144);
});


test('Test arguments squeeze', () => {
  expectEval(`
    (def f (lambda (x y) (list x y)))
    (f 3 4)
  `).toBe('(3 4)');

  expectEval(`
    (def f (lambda (x y) (list x y)))
    (f 3 4 5 6)
  `).toBe('(3 (4 5 6))');
});


test('Test eval-in', () => {
  expectEval(`
    (def foo 5
         bar 15)

    (def f
      (lambda ()
        (def foo 10
             bar 20)
        (lambda ())))

    eval-in (f)
      list foo bar
  `).toBe('(10 20)');

});

test('Test expression with less parenthesis', () => {
  expectEval(`
    def square
      lambda (x)
        * x
          x

    def pi 3.14
    
    def circumference
      lambda (radius)
        * pi
          square radius

    circumference 4
  `).toBe(50.24);
});
