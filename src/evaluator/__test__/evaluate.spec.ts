import Env from '../../Env';
import { parse } from '../../parser';
import evaluate from '../evaluate';
import valueOf from '../valueOf';

const env = new Env();

env.bindAll({
  baz: 12,
  foo: 'Bar',
});

const evalExpr = (code: string) => valueOf(evaluate(parse(code), env));

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
  expect(evalExpr('(cons 1 2 3 4 5)')).toEqual('(1 2 3 4 5)');
  expect(evalExpr('(cons 1)')).toEqual('(1)');
  expect(evalExpr('(cons)')).toEqual('Nil');

  expect(evalExpr('(def list (cons 1 2 3 4)) (car list)')).toEqual(1);
  expect(evalExpr('(def list (cons 1 2 3 4)) (cdr list)')).toEqual('(2 3 4)');
  expect(evalExpr('(def list (cons 1 2 3 4)) (car (cdr list))')).toEqual(2);
  expect(evalExpr('(def list (cons 1 2 3 4)) (cdr (cdr list))')).toEqual('(3 4)');
});
