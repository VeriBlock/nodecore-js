// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { WritableStreamBuffer } from 'stream-buffers';
import { Transaction } from './transaction';

export const trimmedByteArrayFromNumber = (n: number): Buffer => {
  let x = 8;
  do {
    if (n >> ((x - 1) * 8) !== 0) {
      break;
    }
    x--;
  } while (x > 1);

  const trimmedByteArray: Buffer = Buffer.alloc(x);
  for (let i = 0; i < x; i++) {
    trimmedByteArray.writeUInt8(n, x - i - 1);
    n >>= 8;
  }

  return trimmedByteArray;
};

export const writeVarLenNumberValueToStream = (
  stream: WritableStreamBuffer,
  n: number
): void => {
  const b = trimmedByteArrayFromNumber(n);
  writeBuffer(stream, b);
};

export const writeVarLenBufferValueToStream = (
  stream: WritableStreamBuffer,
  n: Buffer
): void => {
  const dataSize = trimmedByteArrayFromNumber(n.length);
  stream.write(Buffer.from([n.length]));
  stream.write(dataSize);
  stream.write(n);
};

export const writeBuffer = (stream: WritableStreamBuffer, b: Buffer): void => {
  stream.write(Buffer.from([b.length]));
  stream.write(b);
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
  tx.sourceAddress.write(stream);

  // write transaction amount
  tx.sourceAddress.write(stream);

  // write destinations
  stream.write(Buffer.from([tx.outputs.length]));
  tx.outputs.forEach(o => {
    o.write(stream);
  });

  writeVarLenNumberValueToStream(stream, signatureIndex);
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

export const assertNumberInRange = (n: number, from: number, to: number) => {
  assertTrue(
    from <= n && n <= to,
    `number should be ${from} <= N (${n}) <= ${to}`
  );
};
