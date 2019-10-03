import { PublicKey } from './crypto';
import {
  ADDRESS_CHECKSUM_LENGTH,
  ADDRESS_CHECKSUM_START,
  ADDRESS_DATA_END,
  ADDRESS_DATA_START,
  ADDRESS_LENGTH,
  STARTING_CHAR,
} from './const';
import { sha256 } from './hash';
import { InvalidChecksumException } from './exception';
import base58 = require('bs58');

const getDataPortionFromAddress = (address: string): string => {
  return address.substr(ADDRESS_DATA_START, ADDRESS_DATA_END + 1);
};

const getChecksumPortionFromAddress = (address: string): string => {
  return address.substr(ADDRESS_CHECKSUM_START);
};

const chopChecksumStandard = (checksum: string): string => {
  if (checksum.length < ADDRESS_CHECKSUM_LENGTH) {
    throw new InvalidChecksumException();
  }
  return checksum.substr(0, ADDRESS_CHECKSUM_LENGTH + 1);
};

export const isAddressValid = (address: string | null | undefined): boolean => {
  if (!address) {
    return false;
  }

  if (address!.length !== ADDRESS_LENGTH) {
    return false;
  }

  if (address[0] !== STARTING_CHAR) {
    return false;
  }

  const sub: string = getDataPortionFromAddress(address);
  const hash: Buffer = sha256(Buffer.from(sub));
  const b58: string = base58.encode(hash);

  return chopChecksumStandard(b58) === getChecksumPortionFromAddress(address);
};

export const addressFromPublicKey = (publicKey: PublicKey | Buffer): string => {
  if (publicKey instanceof Buffer) {
    publicKey = new PublicKey(publicKey);
  }

  const b58 = base58.encode(sha256(publicKey.asn1));
  const slice = b58.slice(ADDRESS_DATA_START, ADDRESS_DATA_END);
  const address = STARTING_CHAR + slice;

  const checksum = chopChecksumStandard(
    base58.encode(sha256(Buffer.from(address)))
  );

  return address + checksum;
};
