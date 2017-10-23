import flattenize from './flattenizer';
import { CLOSE_PARENTHESIS, NEW_LINE, OPEN_PARENTHESIS, SPACE } from './lexeme';

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
    SPACE, 'def', 'a', 'b', NEW_LINE,
    SPACE, 'def', 'c', 'd',
  ]);
  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, "def", "a", "b", CLOSE_PARENTHESIS,
    OPEN_PARENTHESIS, "def", "c", "d", CLOSE_PARENTHESIS,
  ]);
});

test('Flattenize lines with indents #1', () => {
  const lexemes = flattenize([
    'def', 'a', 'b', NEW_LINE,
    SPACE, 'def', 'c', 'd',
  ]);
  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, "def", "a", "b",
    OPEN_PARENTHESIS, "def", "c", "d", CLOSE_PARENTHESIS, CLOSE_PARENTHESIS,
  ]);
});

test('Flattenize lines with indents #2', () => {
  const lexemes = flattenize([
    'def', 'a', 'b', NEW_LINE,
    SPACE, 'def', 'c', 'd', NEW_LINE,
    'e', 'f',
  ]);

  expect(lexemes).toEqual([
    OPEN_PARENTHESIS, 'def', 'a', 'b',
    OPEN_PARENTHESIS, 'def', 'c', 'd', CLOSE_PARENTHESIS,
    OPEN_PARENTHESIS, 'e', 'f', CLOSE_PARENTHESIS,
  ]);
});
