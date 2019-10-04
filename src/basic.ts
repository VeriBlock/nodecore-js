// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { WritableStreamBuffer } from 'stream-buffers';
import { Address, AddressLike, addressLikeToAddress } from './address';
import { Amount, AmountLike, amountLikeToAmount } from './amount';

export class Output {
  readonly address: Address;
  readonly amount: Amount;

  constructor(address: AddressLike, amount: AmountLike) {
    this.address = addressLikeToAddress(address);
    this.amount = amountLikeToAmount(amount);
  }

  write(b: WritableStreamBuffer): void {
    this.address.write(b);
    this.amount.write(b);
  }
}
