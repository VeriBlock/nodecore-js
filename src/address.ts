import { PublicKey } from './crypto';
import {
  ADDRESS_CHECKSUM_LENGTH,
  ADDRESS_CHECKSUM_START,
  ADDRESS_DATA_END,
  ADDRESS_DATA_START,
  ADDRESS_LENGTH,
  ENDING_CHAR_MULTISIG,
  MULTISIG_ADDRESS_CHECKSUM_END,
  MULTISIG_ADDRESS_CHECKSUM_LENGTH,
  MULTISIG_ADDRESS_CHECKSUM_START,
  MULTISIG_ADDRESS_DATA_END,
  MULTISIG_ADDRESS_DATA_START,
  MULTISIG_ADDRESS_ID,
  MULTISIG_ADDRESS_LENGTH,
  MULTISIG_ADDRESS_M_VALUE,
  MULTISIG_ADDRESS_MAX_M_VALUE,
  MULTISIG_ADDRESS_MAX_N_VALUE,
  MULTISIG_ADDRESS_MIN_N_VALUE,
  MULTISIG_ADDRESS_N_VALUE,
  STANDARD_ADDRESS_ID,
  STARTING_CHAR,
} from './const';
import { sha256 } from './hash';
import { InvalidChecksumException } from './exception';
import { Base58 } from './base58';
import { WritableStreamBuffer } from 'stream-buffers';
import { Base59 } from './base59';
import { Type } from './transaction';
import { writeBuffer } from './util';

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

const getChecksumPortionFromMultisigAddress = (address: string): string => {
  return address.substr(
    MULTISIG_ADDRESS_CHECKSUM_START,
    MULTISIG_ADDRESS_CHECKSUM_END + 1
  );
};

const chopChecksumMultisig = (checksum: string): string => {
  return checksum.substr(0, MULTISIG_ADDRESS_CHECKSUM_LENGTH + 1);
};

export const isValidStandardAddress = (
  address: string | null | undefined
): boolean => {
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
  const b58: string = Base58.encode(hash);

  return chopChecksumStandard(b58) === getChecksumPortionFromAddress(address);
};

export const isValidMultisigAddress = (
  address: string | null | undefined
): boolean => {
  if (!address) {
    return false;
  }

  if (address.length !== MULTISIG_ADDRESS_LENGTH) {
    return false;
  }

  if (address[address.length - 1] !== ENDING_CHAR_MULTISIG) {
    return false;
  }

  const m: number = Base58.decode(address[MULTISIG_ADDRESS_M_VALUE])[0] + 1;
  const n: number = Base58.decode(address[MULTISIG_ADDRESS_N_VALUE])[0] + 1;

  if (n < MULTISIG_ADDRESS_MIN_N_VALUE) {
    return false;
  }

  if (m > n) {
    return false;
  }

  if (n > MULTISIG_ADDRESS_MAX_N_VALUE || m > MULTISIG_ADDRESS_MAX_M_VALUE) {
    return false;
  }

  const base = address.substr(
    MULTISIG_ADDRESS_DATA_START,
    MULTISIG_ADDRESS_CHECKSUM_END + 1
  );
  if (!Base58.decodeUnsafe(base)) {
    // weren't able to decode
    return false;
  }

  const checksum: string = address.substr(
    MULTISIG_ADDRESS_DATA_START,
    MULTISIG_ADDRESS_DATA_END + 1
  );

  return (
    chopChecksumMultisig(checksum) ===
    getChecksumPortionFromMultisigAddress(address)
  );
};

export const addressFromPublicKey = (publicKey: PublicKey | Buffer): string => {
  if (publicKey instanceof Buffer) {
    publicKey = new PublicKey(publicKey);
  }

  const b58 = Base58.encode(sha256(publicKey.asn1));
  const slice = b58.slice(ADDRESS_DATA_START, ADDRESS_DATA_END);
  const address = STARTING_CHAR + slice;

  const checksum = chopChecksumStandard(
    Base58.encode(sha256(Buffer.from(address)))
  );

  return address + checksum;
};

export class Address {
  readonly addressType: Type | undefined;

  constructor(readonly value: string) {
    if (!this.addressType && isValidStandardAddress(value)) {
      this.addressType = Type.STANDARD;
    }

    if (!this.addressType && isValidMultisigAddress(value)) {
      this.addressType = Type.MULTISIG;
    }

    if (!this.addressType) {
      throw new Error('invalid address');
    }
  }

  write(b: WritableStreamBuffer) {
    let bytes: Buffer;
    switch (this.addressType) {
      case Type.MULTISIG:
        b.write(MULTISIG_ADDRESS_ID);
        bytes = Base59.decode(this.value);
        break;
      case Type.STANDARD:
        b.write(STANDARD_ADDRESS_ID);
        bytes = Base58.decode(this.value);
        break;
      default:
        // if thrown, this is likely to be a programming error
        throw new Error('can not determine address type');
    }

    writeBuffer(b, bytes);
  }
}
