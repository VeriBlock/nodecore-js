import basex from 'base-x';
import * as address from './address';
import * as transaction from './transaction';
import * as util from './util';
import * as crypto from './crypto';
import * as base58 from './base58';
import * as base59 from './base59';
import * as consts from './const';
import * as hash from './hash';

import secp256k1 from 'secp256k1';

module.exports = {
  address,
  transaction,
  unit:{
    util,
    crypto,
    consts,
    hash,
  },
  enc: {
    base58,
    base59,
    basex
  },
  lib: {
    Buffer,
    secp256k1
  },
}
