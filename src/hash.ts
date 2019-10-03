import do_sha256 from 'fast-sha256';

export const sha256 = (buffer: Buffer): Buffer => {
  return Buffer.from(do_sha256(buffer));
};
