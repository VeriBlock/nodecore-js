export class ReadStream {
  private pos = 0;
  constructor(private readonly data: Buffer) {}

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