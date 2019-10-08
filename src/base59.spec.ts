import fs from 'fs';
import { Base59 } from './base59';

describe('base59 test', () => {
  it('check Java - JS similarity', () => {
    const base59hex = fs
      .readFileSync('testData/base59.hex.txt', 'utf-8')
      .split(/\r?\n/);
    const base59java = fs
      .readFileSync('testData/base59.java.txt', 'utf-8')
      .split(/\r?\n/);

    expect(base59hex.length).toEqual(base59java.length);
    for (let i = 0; i < base59hex.length; i++) {
      const buff = Buffer.from(base59hex[i], 'hex');
      const base59js = Base59.encode(buff);
      expect(base59js).toEqual(base59java[i]);
    }
  });
});
