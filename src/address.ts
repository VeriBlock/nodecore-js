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
import { toBase58 } from './converter';
import { InvalidChecksumException } from './exception';

export class Address {
  constructor(private hash: string, private pubkey: PublicKey) {}
}

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

export const isAddressValid = (address?: string): boolean => {
  if (!address) {
    return false;
  }

  if (address.length !== ADDRESS_LENGTH) {
    return false;
  }

  if (address[0] !== STARTING_CHAR) {
    return false;
  }

  const sub: string = getDataPortionFromAddress(address);
  const hash: Buffer = sha256(Buffer.from(sub));
  const b58: string = toBase58(hash);

  return chopChecksumStandard(b58) === getChecksumPortionFromAddress(address);
};
