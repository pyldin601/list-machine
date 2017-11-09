import { List } from '../';

test('Empty', () => {
  const l = List.Nil;
  expect(l).toBeInstanceOf(List);
  expect(l.isEmpty()).toBeTruthy();
  expect(l.toString()).toBe('Nil');
});

test('List.of', () => {
  const l = List.of(1, 2, 3);
  expect(l.isEmpty()).toBeFalsy();
  expect(l.toString()).toBe('(1 2 3)');
});

test('.prepend', () => {
  const l = List.of(1, 2, 3).prepend(0);
  expect(l.toString()).toBe('(0 1 2 3)');
});

test('.append', () => {
  const l = List.of(1, 2, 3).append(4);
  expect(l.toString()).toBe('(1 2 3 4)');
});

test('.concat', () => {
  const l1 = List.of(1, 2, 3);
  const l2 = List.of(4, 5, 6);
  const l = l1.concat(l2);
  expect(l.toString()).toBe('(1 2 3 4 5 6)');
});

test('.length', () => {
  expect(List.of(1, 2, 3).length).toBe(3);
});

test('.reduce', () => {
  expect(List.of(1, 2, 3).reduce((acc, item) => acc + item, 0)).toBe(6);
});
