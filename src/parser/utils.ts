import { INT32_MAX } from './const';
import { ReadStream } from './stream';
import { TxType } from './entities';
import BigNumber from 'bignumber.js';

export const checkLength = (len: number, min: number, max: number): void => {
  if (len < min) {
    throw new Error(`Unexpected length: length:${len} < min:${min}`);
  }

  if (len > max) {
    throw new Error(`Unexpected length: length:${len} > max:${max}`);
  }
};

export const pad = (buf: Buffer, size: number): Buffer => {
  if (buf.length >= size) {
    return buf;
  }

  const diff = Math.abs(buf.length - size); // number of bytes to add

  return Buffer.concat([Buffer.alloc(diff), buf]);
};

export const readSingleByteLenValue = (
  stream: ReadStream,
  min: number,
  max: number
): Buffer => {
  const lengthLength: number = stream.readUInt8();
  checkLength(lengthLength, min, max);
  return stream.read(lengthLength);
};

export const readVarLenValue = (
  stream: ReadStream,
  min = 0,
  max = INT32_MAX
): Buffer => {
  const lengthLength: number = stream.readUInt8();
  checkLength(lengthLength, 0, 4);

  const v = stream.read(lengthLength);
  const lengthBytes: Buffer = pad(v, 4);
  const length = lengthBytes.readInt32BE(0);
  checkLength(length, min, max);

  return stream.read(length);
};

export interface NetworkBytePair {
  networkByte: number | undefined;
  typeId: number;
}

export const readNetworkByte = (stream: ReadStream): NetworkBytePair => {
  let networkByte = undefined;
  let typeId = undefined;
  const networkOrType = stream.readInt8();
  if (networkOrType !== TxType.VBK_TX) {
    networkByte = networkOrType;
    typeId = stream.readInt8();
  } else {
    typeId = networkOrType;
  }
  return {
    networkByte,
    typeId,
  };
};

export const readSingleInt32BEValue = (stream: ReadStream): number => {
  return readSingleByteLenValue(stream, 4, 4).readInt32BE(0);
};

export const readArrayOf = <T>(
  stream: ReadStream,
  minSize: number,
  maxSize: number,
  min: number,
  max: number,
  readFunc: (stream: ReadStream) => T
): T[] => {
  const count = pad(
    readSingleByteLenValue(stream, minSize, maxSize),
    4
  ).readInt32BE(0);
  if (count < min || count > max) {
    throw new Error(
      `Unexpected array size: ${count} (expected a value between ${min} and ${max})`
    );
  }

  const array: T[] = [];
  for (let i = 0; i < count; i++) {
    array.push(readFunc(stream));
  }

  return array;
};

const bn256 = new BigNumber(256);
const shiftLeftAndAdd = (bn: BigNumber, byte: number): BigNumber => {
  return bn.multipliedBy(bn256).plus(new BigNumber(byte));
};

export const readSingleInt64BEValue = (stream: ReadStream): BigNumber => {
  const bytes = pad(readSingleByteLenValue(stream, 0, 8), 8);
  let bn = new BigNumber(0);
  for (let i = 0; i < bytes.length; i++) {
    bn = shiftLeftAndAdd(bn, bytes[i]);
  }
  return bn;
};
