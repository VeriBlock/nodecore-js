import { pad } from '../src/utils';

interface PadTestCase {
  initial: number[];
  size: number;
  expected: number[];
}

const padTestCases: PadTestCase[] = [
  {
    initial: [],
    size: 4,
    expected: [0, 0, 0, 0],
  },
  {
    initial: [1],
    size: 4,
    expected: [0, 0, 0, 1],
  },
  {
    initial: [1, 2],
    size: 4,
    expected: [0, 0, 1, 2],
  },
  {
    initial: [1, 2, 3],
    size: 4,
    expected: [0, 1, 2, 3],
  },
  {
    initial: [1, 2, 3, 4],
    size: 4,
    expected: [1, 2, 3, 4],
  },
  {
    initial: [1, 2, 3, 4, 5],
    size: 4,
    expected: [1, 2, 3, 4, 5],
  },
];

describe('util', () => {
  padTestCases.forEach(tc => {
    it(`pad; initial:${tc.initial}, size:${tc.size}, expected:${tc.expected}`, () => {
      const b = Buffer.from(tc.initial);
      const padded = pad(b, tc.size);
      expect(padded).toEqual(Buffer.from(tc.expected));
    });
  });
});
