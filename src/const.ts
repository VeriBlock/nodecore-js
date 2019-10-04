// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

export const ADDRESS_LENGTH = 30;
export const MULTISIG_ADDRESS_LENGTH = 30;

export const ADDRESS_DATA_START = 0;
export const ADDRESS_DATA_END = 24;
export const MULTISIG_ADDRESS_DATA_START = 0;
export const MULTISIG_ADDRESS_DATA_END = 24;

export const ADDRESS_CHECKSUM_START = 25;
export const ADDRESS_CHECKSUM_END = 29;
export const ADDRESS_CHECKSUM_LENGTH =
  ADDRESS_CHECKSUM_END - ADDRESS_CHECKSUM_START;
export const MULTISIG_ADDRESS_CHECKSUM_START = 25;
export const MULTISIG_ADDRESS_CHECKSUM_END = 28;
export const MULTISIG_ADDRESS_CHECKSUM_LENGTH =
  MULTISIG_ADDRESS_CHECKSUM_END - MULTISIG_ADDRESS_CHECKSUM_START;

export const MULTISIG_ADDRESS_M_VALUE = 1;
export const MULTISIG_ADDRESS_N_VALUE = 2;

export const MULTISIG_ADDRESS_MIN_M_VALUE = 1;
export const MULTISIG_ADDRESS_MIN_N_VALUE = 2;
export const MULTISIG_ADDRESS_MAX_M_VALUE = 58;
export const MULTISIG_ADDRESS_MAX_N_VALUE = 58;
export const MULTISIG_ADDRESS_SIGNING_GROUP_START = 3;
export const MULTISIG_ADDRESS_SIGNING_GROUP_END = 24;
export const MULTISIG_ADDRESS_SIGNING_GROUP_LENGTH =
  MULTISIG_ADDRESS_SIGNING_GROUP_END - MULTISIG_ADDRESS_SIGNING_GROUP_START;

export const MULTISIG_ADDRESS_IDENTIFIER_INDEX = 30;

export const DIFFICULTY_CALCULATOR_MAXIMUM_TARGET: bigint = BigInt(
  '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
);

/* The starting character makes addresses easy for humans to recognize. 'V' for VeriBlock. */
export const STARTING_CHAR = 'V';

/* '0' for multisig as '0' is not part of the Base-58 alphabet */
export const ENDING_CHAR_MULTISIG = '0';

export const VBLAKE_HASH_OUTPUT_SIZE_BYTES = 24;

export const STANDARD_ADDRESS_ID = 0x01;
export const MULTISIG_ADDRESS_ID = 0x03;

export const STANDARD_TRANSACTION_ID = 0x01;
export const MULTISIG_TRANSACTION_ID = 0x03;
