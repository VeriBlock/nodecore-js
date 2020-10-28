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

  readUInt64From5Bytes(): number {
    const buf = this.read(5)
    return buf.readUInt32BE() << 8 | buf[buf.length - 1]
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

  writeUInt64BEto5Bytes(n: number): void {
    const uint32 = n >> 8
    const first = n >> 32
    this.data.writeUInt8(first, this.pos)
    this.pos += 1
    this.data.writeUInt32BE(uint32, this.pos)
    this.pos += 4
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
