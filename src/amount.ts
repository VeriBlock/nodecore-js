// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { WritableStreamBuffer } from 'stream-buffers';
import {
  assertInt,
  assertNumberInRange,
  writeVarLenNumberValueToStream,
} from './util';

export class Amount {
  constructor(readonly value: number) {
    // max number is int64 max value
    assertNumberInRange(value, 0, 0x7fffffffffffffff);
    assertInt(value);
  }

  write(b: WritableStreamBuffer) {
    writeVarLenNumberValueToStream(b, this.value);
  }
}

export type AmountLike = Amount | number;

export const amountLikeToAmount = (amountLike: AmountLike): Amount => {
  if (amountLike instanceof Amount) {
    return amountLike;
  } else {
    return new Amount(amountLike);
  }
};
