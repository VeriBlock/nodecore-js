import { ReadStream } from '../../src/parser';

describe('read stream', () => {
  it('read', () => {
    const stream = new ReadStream(Buffer.from([0, 1, 2, 3]));

    expect(stream.read(1)).toEqual(Buffer.from([0]));
    expect(stream.read(1)).toEqual(Buffer.from([1]));
    expect(stream.read(1)).toEqual(Buffer.from([2]));
    expect(stream.read(1)).toEqual(Buffer.from([3]));
    expect(() => stream.read(1)).toThrow();
    stream.reset();
    expect(stream.read(2)).toEqual(Buffer.from([0, 1]));
    expect(stream.read(2)).toEqual(Buffer.from([2, 3]));
    stream.reset();
    expect(stream.read(4)).toEqual(Buffer.from([0, 1, 2, 3]));
    stream.reset();
    expect(() => stream.read(5)).toThrow();
  });

  it('numbers', ()=>{
    const stream = new ReadStream(Buffer.from([0xa, 0xb, 0xc, 0xd]));

    expect(stream.readInt8()).toEqual(0xa);
    expect(stream.readUInt8()).toEqual(0xb);
    stream.reset();
    expect(stream.readInt16BE()).toEqual(0x0a0b);
    expect(stream.readInt16LE()).toEqual(0x0d0c);
    stream.reset();
    expect(stream.readUInt16BE()).toEqual(0x0a0b);
    expect(stream.readUInt16LE()).toEqual(0x0d0c);
    stream.reset();
    expect(stream.readUInt32BE()).toEqual(0x0a0b0c0d);
    stream.reset();
    expect(stream.readInt32BE()).toEqual(0x0a0b0c0d);
    stream.reset();
    expect(stream.readUInt32LE()).toEqual(0x0d0c0b0a);
    stream.reset();
    expect(stream.readInt32LE()).toEqual(0x0d0c0b0a);
  });

  it('negative', ()=>{
    // -1
    const stream = new ReadStream(Buffer.from([0xff, 0xff, 0xff, 0xff]));

    expect(stream.readUInt32BE()).toEqual(4294967295);
    expect(() => stream.readInt32BE()).toThrow();
    stream.reset();
    expect(stream.readInt32BE()).toEqual(-1);
  })
});
