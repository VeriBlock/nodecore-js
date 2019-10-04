import base_x from 'base-x';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0';
const bs59 = base_x(ALPHABET);

export class Base59 {
  static encode = (b: Buffer): string => {
    return bs59.encode(b);
  };

  static decode = (s: string): Buffer => {
    return bs59.decode(s);
  };

  static decodeUnsafe = (s: string): Buffer | undefined => {
    return bs59.decodeUnsafe(s);
  };
}

export const isBase59String = (s: string): boolean => {
  for (let i = 0; i < s.length; ++i) {
    if (ALPHABET.indexOf(s[i]) === -1) {
      return false;
    }
  }

  return true;
};
