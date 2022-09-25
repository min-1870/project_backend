import { echo } from './echo';

test('Test successful echo', () => {
  let result = echo('1');
  expect(result).toBe('1');
  result = echo('abc');
  expect(result).toBe('abc');
});

test('Test invalid echo', () => {
  expect(echo({ echo: 'echo' })).toStrictEqual({ error: 'error' });
});
