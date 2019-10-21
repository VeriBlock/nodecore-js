import * as address from './address';
import * as transaction from './transaction';
import * as util from './util';
import * as crypto from './crypto';
import * as base58 from './base58';
import * as base59 from './base59';
import * as consts from './const';
import * as hash from './hash';

// external libs
import BigNumber from 'bignumber.js';
import { WritableStreamBuffer } from 'stream-buffers';

const jsonBig = require('json-bigint');

module.exports = {
  address,
  transaction,
  util,
  crypto,
  consts,
  hash,
  base58,
  base59,
  libs: { jsonBig, Buffer, BigNumber, WritableStreamBuffer },
};
