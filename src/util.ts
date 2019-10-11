// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { WritableStreamBuffer } from 'stream-buffers';
import { Amount, Byte, Transaction } from './transaction';
import { AMOUNT_MAX, MULTISIG_ADDRESS_ID, STANDARD_ADDRESS_ID } from './const';
import { Base59 } from './base59';
import { Base58 } from './base58';
import {
  Address,
  isValidMultisigAddress,
  isValidStandardAddress,
} from './address';
import BigNumber from 'bignumber.js';

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

export const writeBuffer = (stream: WritableStreamBuffer, b: Buffer): void => {
  stream.write(Buffer.from([b.length]));
  stream.write(b);
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
) => {
  const stream = new WritableStreamBuffer({
    initialSize: 1000,
  });

  stream.write(Buffer.from([tx.type]));

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
  // put empty buffer
  writeVarLenBufferValueToStream(stream, Buffer.alloc(0));

  stream.end();

  const result: Buffer | false = stream.getContents();
  if (result && result instanceof Buffer) {
    return result;
  } else {
    throw new Error('buffer error');
  }
};

export const assertTrue = (condition: boolean, msg: string) => {
  if (!condition) {
    throw new Error(msg);
  }
};

export const assertInt = (n: number, msg?: string) => {
  assertTrue(
    Number.isInteger(n),
    `${msg ? `[${msg}] ` : ''}should be an integer`
  );
};

export const assertPositive = (n: number, msg?: string) => {
  assertTrue(n > 0, `${msg ? `[${msg}] ` : ''}number should be positive`);
};

export const assertMaxNumber = (n: number, max: number, msg?: string) => {
  assertTrue(n < max, `${msg ? `[${msg}] ` : ''}number is > ${max}`);
};

export const assertNumberInRange = (
  n: BigNumber,
  from: BigNumber,
  to: BigNumber
) => {
  assertTrue(
    n.gte(from) && n.lte(to),
    `number should be ${from} <= N (${n}) <= ${to}`
  );
};

export const assertAddressValid = (addr: Address) => {
  assertTrue(
    isValidStandardAddress(addr) || isValidMultisigAddress(addr),
    'invalid address'
  );
};

export const assertByteValid = (byte: Byte) => {
  assertNumberInRange(
    new BigNumber(byte),
    new BigNumber(0),
    new BigNumber(255)
  );
};

export const assertAmountValid = (amount: Amount) => {
  assertNumberInRange(makeBigNumber(amount), new BigNumber(0), AMOUNT_MAX);
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
