import { toArray } from 'lodash';
import { readFromString } from '../reader';

test('Read empty string', () => {
  const generator = readFromString('');

  expect(toArray(generator)).toEqual([]);
});

test('Read string', () => {
  const generator = readFromString(' ');

  expect(toArray(generator)).toEqual([ 32 ]);
});
