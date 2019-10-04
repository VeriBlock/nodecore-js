import basex from 'base-x';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const bs58 = basex(ALPHABET);

export class Base58 {
  static encode = (b: Buffer): string => {
    return bs58.encode(b);
  };

  static decode = (s: string): Buffer => {
    return bs58.decode(s);
  };

  static decodeUnsafe = (s: string): Buffer | undefined => {
    return bs58.decodeUnsafe(s);
  };
}
