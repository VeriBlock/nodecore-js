// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import basex from 'base-x';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const bs58 = basex(ALPHABET);

export class Base58 {
  static encode = (b: Buffer): string => {
    return bs58.encode(b);
  };

  static decode = (s: string): Buffer => {
    return bs58.decode(s);
  };

  static decodeUnsafe = (s: string): Buffer | undefined => {
    return bs58.decodeUnsafe(s);
  };
}
