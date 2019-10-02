import bs58 from 'bs58';

export const toBase58 = (buffer: Buffer): string => {
  return bs58.encode(buffer);
};

export const fromBase58 = (base58: string): Buffer => {
  return bs58.decode(base58);
};
