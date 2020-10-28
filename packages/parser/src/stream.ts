import { pad } from './utils';

export class ReadStream {
  private pos = 0;
  private data: Buffer;
  constructor(inp: Buffer | string) {
    if (typeof inp === 'string') {
      inp = Buffer.from(inp, 'hex');
    }
    this.data = inp;
  }

  read(size: number): Buffer {
    if (size <= 0) {
      throw new Error('stream: can not read <= 0 bytes');
    }

    this.assertHasMore(size);

    const ret = this.data.slice(this.pos, this.pos + size);
    this.skip(size);
    return ret;
  }

  readInt8(): number {
    return this.read(1).readInt8(0);
  }

  readUInt8(): number {
    return this.read(1).readUInt8(0);
  }

  readInt16BE(): number {
    return this.read(2).readInt16BE(0);
  }

  readUInt16BE(): number {
    return this.read(2).readUInt16BE(0);
  }

  readInt32BE(): number {
    return this.read(4).readInt32BE(0);
  }

  readUInt32BE(): number {
    return this.read(4).readUInt32BE(0);
  }

  readInt16LE(): number {
    return this.read(2).readInt16LE(0);
  }

  readUInt16LE(): number {
    return this.read(2).readUInt16LE(0);
  }

  readInt32LE(): number {
    return this.read(4).readInt32LE(0);
  }

  readUInt32LE(): number {
    return this.read(4).readUInt32LE(0);
  }

  readUInt64FromBytes(bytes: number): bigint {
    if (bytes > 8) {
      throw new Error(`can't read uint64 from ${bytes} bytes`);
    }
    const buf = this.read(bytes);
    const padded = pad(buf, 8);
    return padded.readBigUInt64BE(0);
  }

  position(): number {
    return this.pos;
  }

  remaining(): number {
    return this.data.length - this.pos;
  }

  hasMore(bytes: number): boolean {
    return this.remaining() >= bytes;
  }

  reset(): void {
    this.pos = 0;
  }

  private skip(bytes: number): void {
    this.pos += bytes;
  }

  private assertHasMore(bytes: number): void {
    if (!this.hasMore(bytes)) {
      // buffer does not have 'size' bytes
      throw new Error('stream: out of data');
    }
  }
}

export class WriteStream {
  private pos = 0;
  readonly data: Buffer;

  constructor(size: number) {
    if (size <= 0) {
      throw new Error(`invalid size: ${size}`);
    }

    this.data = Buffer.alloc(size);
  }

  position(): number {
    return this.pos;
  }

  reset(): void {
    this.pos = 0;
  }

  clear(): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = 0;
    }
  }

  remaining(): number {
    return this.data.length - this.pos;
  }

  hasMore(bytes: number): boolean {
    return this.remaining() >= bytes;
  }

  write(buf: Buffer): void {
    if (!this.hasMore(buf.length)) {
      throw new Error(`WriteStream: buffer overflow`);
    }

    for (let i = 0; i < buf.length; i++) {
      this.data[this.pos + i] = buf[i];
    }
    this.pos += buf.length;
  }

  writeInt32LE(n: number): void {
    this.data.writeInt32LE(n, this.pos);
    this.pos += 4;
  }

  writeInt16LE(n: number): void {
    this.data.writeInt16LE(n, this.pos);
    this.pos += 2;
  }

  writeInt32BE(n: number): void {
    this.data.writeInt32BE(n, this.pos);
    this.pos += 4;
  }

  writeUInt64BEBytes(n: bigint, bytes: number): void {
    if (bytes > 8) {
      throw new Error(`can not write UInt64BE ${bytes}`);
    }

    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(n, 0);
    for (let i = 0; i < bytes; i++) {
      this.data[this.pos + i] = buf[i];
    }
    this.pos += bytes;
  }

  writeInt16BE(n: number): void {
    this.data.writeInt16BE(n, this.pos);
    this.pos += 2;
  }

  writeInt8(n: number): void {
    this.data.writeInt8(n, this.pos);
    this.pos += 1;
  }

  writeUInt8(n: number): void {
    this.data.writeUInt8(n, this.pos);
    this.pos += 1;
  }
}
