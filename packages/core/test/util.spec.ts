import { trimmedByteArrayFromNumber } from '../src';
import BigNumber from 'bignumber.js';

const cases = [
  {
    n: 0,
    result: [0],
  },
  {
    n: 1,
    result: [1],
  },
  {
    n: 255,
    result: [0xff],
  },
  {
    n: 256,
    result: [0x01, 0x00],
  },
  {
    n: -1,
    result: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
  },
];

describe('can trim number', () => {
  cases.forEach(({ n, result }) =>
    it(`${n}`, () => {
      expect(
        trimmedByteArrayFromNumber(new BigNumber(n)).toString('hex')
      ).toEqual(Buffer.from(result).toString('hex'));
    })
  );
});
