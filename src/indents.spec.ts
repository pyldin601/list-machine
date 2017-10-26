import flattenize from './indents';
import { CLOSE_PARENTHESIS, INDENT, NEW_LINE, OPEN_PARENTHESIS } from './tokens';

test('Flattenize empty program', () => {
  const lexemes = flattenize([]);
  expect(lexemes).toEqual([]);
});

test('Flattenize single line', () => {
  const lexemes = flattenize([
    'def', 'a', 'b',
  ]);
  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, 'def', 'a', 'b', CLOSE_PARENTHESIS,
  ]);
});

test('Flattenize two lines without indents', () => {
  const lexemes = flattenize([
    'def', 'a', 'b', NEW_LINE,
    'def', 'c', 'd',
  ]);
  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, "def", "a", "b", CLOSE_PARENTHESIS,
    OPEN_PARENTHESIS, "def", "c", "d", CLOSE_PARENTHESIS,
  ]);
});

test('Flattenize two lines with same indents', () => {
  const lexemes = flattenize([
    INDENT, 'def', 'a', 'b', NEW_LINE,
    INDENT, 'def', 'c', 'd',
  ]);
  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, "def", "a", "b", CLOSE_PARENTHESIS,
    OPEN_PARENTHESIS, "def", "c", "d", CLOSE_PARENTHESIS,
  ]);
});

/*
 foo a b
   bar c d
 */
test('Flattenize lines with indents #1', () => {
  const lexemes = flattenize([
    'foo', 'a', 'b', NEW_LINE,
    INDENT, 'bar', 'c', 'd',
  ]);
  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, "foo", "a", "b",
    OPEN_PARENTHESIS, "bar", "c", "d", CLOSE_PARENTHESIS, CLOSE_PARENTHESIS,
  ]);
});

/*
 def a b
   def c d
 e f
 */
test('Flattenize lines with indents #2', () => {
  const lexemes = flattenize([
    'def', 'a', 'b', NEW_LINE,
    INDENT, 'def', 'c', 'd', NEW_LINE,
    'e', 'f',
  ]);

  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, 'def', 'a', 'b',
    OPEN_PARENTHESIS, 'def', 'c', 'd', CLOSE_PARENTHESIS, CLOSE_PARENTHESIS,
    OPEN_PARENTHESIS, 'e', 'f', CLOSE_PARENTHESIS,
  ]);
});

test('Do not flattenize parenthesis', () => {
  const lexemes = flattenize([
    OPEN_PARENTHESIS, 'def', 'a', 'b', CLOSE_PARENTHESIS,
  ]);

  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, 'def', 'a', 'b', CLOSE_PARENTHESIS,
  ]);
});

test('Do not flattenize single symbol', () => {
  const lexemes = flattenize([
    'foo',
  ]);

  expect(lexemes).toEqual([
    'foo',
  ]);
});



/*
    def f                     (def f
      lambda ()                 (lambda ()
        (def foo 10      =>       (def foo 10
             bar 20)                   bar 20)
        lambda ()                 (lambda ())))
 */

test('Issue #1', () => {
  const lexemes = flattenize([
    'def', 'f', NEW_LINE,
    INDENT, 'lambda', OPEN_PARENTHESIS, CLOSE_PARENTHESIS, NEW_LINE,
    INDENT, INDENT, OPEN_PARENTHESIS, 'def', 'foo', '10', 'bar', '20', CLOSE_PARENTHESIS, NEW_LINE,
    INDENT, INDENT, 'lambda', OPEN_PARENTHESIS, CLOSE_PARENTHESIS, NEW_LINE,
  ]);

  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, 'def', 'f',
                      OPEN_PARENTHESIS, 'lambda', OPEN_PARENTHESIS, CLOSE_PARENTHESIS,
                                        OPEN_PARENTHESIS, OPEN_PARENTHESIS, 'def', 'foo', '10', 'bar', '20', CLOSE_PARENTHESIS, CLOSE_PARENTHESIS,
                                        OPEN_PARENTHESIS, 'lambda', OPEN_PARENTHESIS, CLOSE_PARENTHESIS, CLOSE_PARENTHESIS, CLOSE_PARENTHESIS, CLOSE_PARENTHESIS,
  ]);
});
