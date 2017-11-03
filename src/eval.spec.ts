import evalString from './eval';
import toPrintable from './printer';

const expectEval = (program: string) => expect(toPrintable(evalString(program)));

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
  expectEval('def a 4\n+ a 2').toBe(6);
});

test('Spread operator', () => {
  expectEval(`
    (list 1 2 3 *(list 4 5))
  `).toBe('(1 2 3 4 5)');
});

test('Test lambda #0', () => {
  expectEval(`
    lambda (x) (* 2 x)
  `).toBe('(lambda (x) (* 2 x))');
});

test('Test lambda #1', () => {
  expectEval(`
    ((lambda (x) (* 2 x)) 5)
  `).toBe(10);
});

test('Test lambda: Rest operator', () => {
  expectEval(`
    ((lambda (x *y) (list x y)) 1 2 3 4 5)
  `).toBe('(1 (2 3 4 5))');
});

test('Test lambda: Double rest operator', () => {
  try {
    expectEval(`
      ((lambda (x *y *z) (list x y z)) 1 2 3 4 5)
    `).toBe('(1 (2 3 4 5) ())');

    fail('Should be error here');
  } catch (e) {
    // NOP
  }
});


test('Test lambda #3', () => {
  expectEval(`
    def pi 3.14
    def circumference
      lambda (r) (* 2 pi r)
    circumference 2
  `).toBe(12.56);
});

test('Test lambda #2', () => {
  expectEval(`
    def square 
      lambda (x) (* x x)

    def sum-of-squares
      lambda (x y)
        +
          square x
          square y

    sum-of-squares 3 2
  `).toBe(13);
});

test('Test macro #1', () => {
  expectEval(`
    def defmacro2 (macro (name args *body) (def name (macro args *body)))
    expand defmacro2 inc '(n) '(+ 1 n)
  `).toBe('(def inc (macro (n) (+ 1 n)))');
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
          (eq? 0 n) 0
          (eq? 1 n) 1
          (+ (fib (- n 2)) (fib (- n 1))))))
    (fib 12)
  `).toBe(144);
});


test('Test call convention', () => {
  expectEval(`
    (def f (lambda (x y) (list x y)))
    (f 3 4)
  `).toBe('(3 4)');

  expectEval(`
    (def f (lambda (x y) (list x y)))
    (f 3 4 5 6)
  `).toBe('(3 4)');
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

test('Test global interoperability #1', () => {
  expectEval('(.toUpperCase (js/String Hello))').toBe('"HELLO"');
});

test('Test global interoperability #2', () => {
  expectEval('(.fill (new js/Array 5) "Hello")').toEqual('("Hello" "Hello" "Hello" "Hello" "Hello")');
});

test('Test global interoperability #3', () => {
  expectEval('(.map \'(1 2 3 4 5) (lambda (x) (* 2 x)))').toEqual('(2 4 6 8 10)');
});

test('Fibonacci Benchmark', () => {
  expectEval(`
    (def fib 
      (lambda (n)
        (cond
          (eq? 0 n) 0
          (eq? 1 n) 1
          (+
            (fib (- n 2))
            (fib (- n 1))))))
    (fib 20)
  `).toEqual(6765);
});

test('Issue #2', () => {
  expectEval(`
    def fib
      lambda (n)
        cond
          (eq? n 0) 0
          (eq? n 1) 1
          +
            fib (- n 2)
            fib (- n 1)
    
    fib 20
  `).toEqual(6765);
});

test('Issue #3', () => {
  const code = `
    def deps-json "
      {
        \\"mongo\\": [],
        \\"tzinfo\\": [\\"thread_safe\\"],
        \\"uglifier\\": [\\"execjs\\"],
        \\"execjs\\": [\\"thread_safe\\", \\"json\\"],
        \\"redis\\": []
      }
    "
    
    def deps-map
      .parse js/JSON deps-json

    defun get-deps (name)
      or 
        get-attr deps-map name
        '()
    
    defun unique (item i list)
      eq?
        .indexOf list item
        i 

    defun compute (deps)
      .reduce deps
        lambda (acc dep)
          .concat
            acc
            compute
              get-deps dep
            list dep
        '()

    defun sort-deps (deps)
      .filter
        compute
          .keys js/Object deps
        unique
    
    sort-deps deps-map
  `;

  expectEval(code).toEqual('("mongo" "thread_safe" "tzinfo" "json" "execjs" "uglifier" "redis")');
});

test('get-attr', () => {
  expectEval(`
    def list '(foo bar baz)
    get-attr list 1
  `).toEqual('bar');
});

test('Test Asterisk #1', () => {
  expectEval(`
    defun foo (a *b)
      b

    foo 2 3 4
  `).toEqual('(3 4)');
});

test('Issue #4', () => {
  expectEval(`
    defun foo (a b)
      def c 20
      + a b

    foo 2 3
  `).toEqual(5);
});
