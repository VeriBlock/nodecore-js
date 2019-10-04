import { WritableStreamBuffer } from 'stream-buffers';
import { writeVarLenNumberValueToStream } from './util';
import { Int64 } from './basic';

export class Amount {
  constructor(readonly value: Int64) {
    if (value.lessThan(0)) {
      throw new Error('amount can not be negative');
    }

    if (value.greaterThan(0xffffffffffffffff)) {
      throw new Error('amount can not be more than 8 bytes');
    }
  }

  write(b: WritableStreamBuffer) {
    writeVarLenNumberValueToStream(b, this.value.toNumber());
  }
}
