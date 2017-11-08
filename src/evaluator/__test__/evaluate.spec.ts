import { Env, evaluate } from '../../';
import valueOf from '../valueOf';

const evalExpr = (code: string) => valueOf(evaluate(code, new Env({ baz: 12, foo: 'Bar' })));

test('Eval nothing', () => {
  expect(evalExpr('')).toEqual('undefined');
});

test('Eval boolean literals', () => {
  expect(evalExpr('true')).toEqual(true);
  expect(evalExpr('false')).toEqual(false);
});

test('Eval numeric literals', () => {
  expect(evalExpr('0')).toEqual(0);
  expect(evalExpr('1234')).toEqual(1234);
  expect(evalExpr('-1234')).toEqual(-1234);
  expect(evalExpr('3.14')).toEqual(3.14);
  expect(evalExpr('1e-11')).toEqual(1e-11);
});

test('Eval string', () => {
  expect(evalExpr('"Hello"')).toEqual('Hello');
  expect(evalExpr('"Hello World"')).toEqual('Hello World');
  expect(evalExpr('"Hello \\"World\\""')).toEqual('Hello "World"');
});

test('Eval unterminated string', () => {
  expect(() => evalExpr('"hello')).toThrow('Unexpected EOF');
});

test('Eval identifier', () => {
  expect(evalExpr('foo')).toEqual("Bar");
  expect(evalExpr('baz')).toEqual(12);
});

test('Eval quoted list', () => {
  expect(evalExpr("'(foo bar baz)")).toEqual("(foo bar baz)");
});

test('Eval expression', () => {
  expect(evalExpr('+ 2 4')).toEqual(6);
  expect(evalExpr('+ 2 (+ 4 1)')).toEqual(7);
});

test('Eval "def" special form', () => {
  expect(evalExpr('def arg "Hello"\narg')).toEqual('Hello');
});

test('Eval "lambda" special form', () => {
  expect(evalExpr('lambda [x y] (+ x y)')).toEqual('(lambda [x y] (+ x y))');
});

test('Eval "macro" special form', () => {
  expect(evalExpr('macro [x y] (+ x y)')).toEqual('(macro [x y] (+ x y))');
});

test('Eval "cons/car/cdr" form', () => {
  expect(evalExpr('(list 1 2 3 4 5)')).toEqual('(1 2 3 4 5)');
  expect(evalExpr('(cons 1 (list 2 3 4 5))')).toEqual('(1 2 3 4 5)');
  expect(evalExpr('(cons 1 Nil)')).toEqual('(1)');
  expect(evalExpr('(list)')).toEqual('Nil');

  expect(evalExpr('(def lst (list 1 2 3 4)) (car lst)')).toEqual(1);
  expect(evalExpr('(def lst (list 1 2 3 4)) (cdr lst)')).toEqual('(2 3 4)');
  expect(evalExpr('(def lst (list 1 2 3 4)) (car (cdr lst))')).toEqual(2);
  expect(evalExpr('(def lst (list 1 2 3 4)) (cdr (cdr lst))')).toEqual('(3 4)');
});

test('Eval macro "expand"', () => {
  expect(evalExpr('expand (macro [x y] (cons x y)) 2 (list 3 4)')).toEqual('(cons 2 (list 3 4))');
});

test('Eval "macro" call', () => {
  expect(evalExpr('((macro [x y] (cons x y)) 2 (list 3 4))')).toEqual('(2 3 4)');
});

test('Eval "lambda" call', () => {
  expect(evalExpr('((lambda [x y] (cons x y)) 2 (list 3 4))')).toEqual('(2 3 4)');
});

test('Impossible list eval', () => {
  expect(() => evalExpr('(1 2 3 4)')).toThrow('Expression (1 2 3 4) is not callable');
});
