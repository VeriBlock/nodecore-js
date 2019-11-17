import { INT32_MAX } from './const';
import { ReadStream } from './stream';

export const checkLength = (len: number, min: number, max: number) => {
  if (len < min) {
    throw new Error(`Unexpected length: length:${len} < min:${min}`);
  }

  if (len > max) {
    throw new Error(`Unexpected length: length:${len} > max:${max}`);
  }
};

const pad = (buf: Buffer, size: number): Buffer => {
  if (buf.length >= size) {
    return buf;
  }

  const diff = buf.length - size; // number of bytes to add

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
) => {
  const lengthLength: number = stream.readUInt8();
  checkLength(lengthLength, 0, 4);

  const lengthBytes: Buffer = pad(stream.read(lengthLength), 4);
  const length = lengthBytes.readInt32BE(0);
  checkLength(length, min, max);

  return stream.read(length);
};
