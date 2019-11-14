// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

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
  MULTISIG_ADDRESS_LENGTH,
  MULTISIG_ADDRESS_M_VALUE,
  MULTISIG_ADDRESS_MAX_M_VALUE,
  MULTISIG_ADDRESS_MAX_N_VALUE,
  MULTISIG_ADDRESS_MIN_N_VALUE,
  MULTISIG_ADDRESS_N_VALUE,
  STARTING_CHAR,
} from './const';
import { sha256 } from './hash';
import { InvalidChecksumException } from './exception';
import { Base58 } from './base58';

export enum AddressType {
  ZERO_UNUSED = 0,
  STANDARD = 1,
  PROOF_OF_PROOF = 2,
  MULTISIG = 3,
}

const getDataPortionFromAddress = (address: string): string => {
  return address.substr(ADDRESS_DATA_START, ADDRESS_DATA_END + 1);
};

const getChecksumPortionFromAddress = (address: string): string => {
  return address.substr(ADDRESS_CHECKSUM_START);
};

export const chopChecksumStandard = (checksum: string): string => {
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

  if (address.length !== ADDRESS_LENGTH) {
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
