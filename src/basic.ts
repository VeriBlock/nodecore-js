import * as Integer from 'integer';
import { WritableStreamBuffer } from 'stream-buffers';
import { Address } from './address';
import { Amount } from './amount';

export type Int64 = Integer.IntClass;

export class Output {
  constructor(readonly address: Address, readonly amount: Amount) {}

  write(b: WritableStreamBuffer): void {
    this.address.write(b);
    this.amount.write(b);
  }
}
