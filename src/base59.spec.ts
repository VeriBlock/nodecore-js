var fs = require('fs');

import * as enc from './base59';

describe('base59 test', () => {
  it('check Java - JS similarity', () => {
    let base59hex  = fs.readFileSync("./../testData/base59.hex.txt", 'utf-8').split(/\r?\n/);
    let base59java = fs.readFileSync("./../testData/base59.java.txt", 'utf-8').split(/\r?\n/);

    expect(base59hex.length).toEqual(base59java.length);
    for(let i = 0; i< base59hex.length; i++){
      let line = base59hex[i];
      let buff = Buffer.from(line, 'hex');
      let base59js = enc.Base59.encode(buff);
      expect(base59js).toEqual(base59java[i]);
    }
  });
});
