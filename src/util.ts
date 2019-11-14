// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { WritableStreamBuffer } from 'stream-buffers';
import { MULTISIG_ADDRESS_ID, STANDARD_ADDRESS_ID } from './const';
import { Base59 } from './base59';
import { Base58 } from './base58';
import {
  AddressType,
  isValidMultisigAddress,
  isValidStandardAddress,
} from './address';
import BigNumber from 'bignumber.js';
import { Amount, Transaction } from './types';

const bigNumberRightShift = (b: BigNumber, bits: number): BigNumber => {
  const p = new BigNumber(2).pow(bits);
  return b.dividedToIntegerBy(p);
};

export const trimmedByteArrayFromNumber = (n: BigNumber): Buffer => {
  let x = 8;

  if (n.isNegative()) {
    // if n=-1, make it = 0xffffffffffffffff
    n = new BigNumber('0xffffffffffffffff', 16).plus(n).plus(1);
  }

  do {
    const c = bigNumberRightShift(n, (x - 1) * 8);
    if (c.comparedTo(0) !== 0) {
      break;
    }
    x--;
  } while (x > 1);

  const trimmedByteArray: Buffer = Buffer.alloc(Number(x));
  for (let i = 0; i < x; i++) {
    const c = n.mod(256).toNumber(); // equivalent of (n & 0xff)
    trimmedByteArray.writeUInt8(c, x - i - 1);
    n = bigNumberRightShift(n, 8);
  }

  return trimmedByteArray;
};

export const writeBuffer = (stream: WritableStreamBuffer, b: Buffer): void => {
  stream.write(Buffer.from([b.length]));
  stream.write(b);
};

export const writeVarLenNumberValueToStream = (
  stream: WritableStreamBuffer,
  n: BigNumber
): void => {
  const b = trimmedByteArrayFromNumber(n);
  writeBuffer(stream, b);
};

export const writeVarLenBufferValueToStream = (
  stream: WritableStreamBuffer,
  n: Buffer
): void => {
  const dataSize = trimmedByteArrayFromNumber(new BigNumber(n.length));
  stream.write(Buffer.from([dataSize.length & 0xff]));
  stream.write(dataSize);
  stream.write(n);
};

export const makeBigNumber = (amount: Amount): BigNumber => {
  switch (typeof amount) {
    case 'bigint':
    case 'string':
    case 'number':
    case 'object':
      return new BigNumber(amount);
    default:
      throw new Error('unknown amount type');
  }
};

const writeAmount = (stream: WritableStreamBuffer, amount: Amount): void => {
  writeVarLenNumberValueToStream(stream, makeBigNumber(amount));
};

const writeAddress = (stream: WritableStreamBuffer, address: string): void => {
  let bytes: Buffer;
  if (isValidStandardAddress(address)) {
    stream.write(Buffer.from([STANDARD_ADDRESS_ID]));
    bytes = Base58.decode(address);
  } else if (isValidMultisigAddress(address)) {
    stream.write(Buffer.from([MULTISIG_ADDRESS_ID]));
    bytes = Base59.decode(address);
  } else {
    throw new Error('invalid address');
  }

  writeBuffer(stream, bytes);
};

export const serializeTransactionEffects = (
  tx: Transaction,
  signatureIndex: number
): Buffer => {
  const stream = new WritableStreamBuffer({
    initialSize: 1000,
  });

  if (isValidStandardAddress(tx.sourceAddress)) {
    stream.write(Buffer.from([AddressType.STANDARD]));
  } else {
    throw new Error('unsupported address type');
  }

  // write transaction address
  writeAddress(stream, tx.sourceAddress);

  // write transaction amount
  writeAmount(stream, tx.sourceAmount);

  // write destinations
  stream.write(Buffer.from([tx.outputs.length]));
  tx.outputs.forEach(o => {
    writeAddress(stream, o.address);
    writeAmount(stream, o.amount);
  });
  writeVarLenNumberValueToStream(stream, new BigNumber(signatureIndex));

  // put data buffer
  writeVarLenBufferValueToStream(stream, Buffer.from(tx.data, 'hex'));

  stream.end();
  const result: Buffer | false = stream.getContents();
  if (result && result instanceof Buffer) {
    return result;
  } else {
    throw new Error('buffer error');
  }
};

export const bufferFromBase64 = (b64: string): Buffer => {
  return Buffer.from(b64, 'base64');
};

export const bufferFromHex = (hex: string): Buffer => {
  return Buffer.from(hex, 'hex');
};

export const bufferFromUtf8 = (utf8: string): Buffer => {
  return Buffer.from(utf8, 'utf8');
};

export const bufferFromArray = (array: string): Buffer => {
  return Buffer.from(array);
};
