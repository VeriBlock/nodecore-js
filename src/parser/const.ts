export const HASH256_SIZE = 32;
export const MAX_LAYER_COUNT_MERKLE = 40;

// size = (hash + hash.length) * MAX_LAYER_COUNT + (index + index.length) + (layers.size + layers.size.length) +
//        (subject.length.size + subject.length.size.size) + (subject.length) + (data_size)
export const MAX_MERKLE_BYTES =
  (HASH256_SIZE + 1) * MAX_LAYER_COUNT_MERKLE + 5 + 5 + 5 + 5 + 4;

export const BTC_HEADER_SIZE = 80;

export const VBK_HEADER_SIZE = 64;

// according to BIP 141 maximum block size is 4000000 bytes
export const MAX_BTC_RAWTX_SIZE = 4000000;

export const MAX_OUTPUTS_COUNT = 255;

export const MAX_SIGNATURE_SIZE = 72;
export const PUBLIC_KEY_SIZE = 88;
export const MAX_CONTENT_COUNT = 150000;
export const INT32_MAX = 2147483647;
export const ADDRESS_SIZE = 30;
export const VBK_MERKLE_ROOT_LENGTH = 16;
export const MAX_RAWTX_SIZE = 4 * 1000 * 1000;

export const PREVIOUS_BLOCK_LENGTH = 12;
export const PREVIOUS_KEYSTONE_LENGTH = 9;

export const MAX_CONTEXT_COUNT = 150000;
export const MAX_HEADER_SIZE_PUBLICATION_DATA = 1024;
export const MAX_PAYOUT_SIZE_PUBLICATION_DATA = 100;
export const MAX_CONTEXT_SIZE_PUBLICATION_DATA = 100;

export const MAX_SIZE_PUBLICATION_DATA =
  // identifier.size, identifier
  9 +
  // header.size.size, header.size, header
  5 +
  MAX_HEADER_SIZE_PUBLICATION_DATA +
  // payoutInfo.size.size, payoutInfo.size, payoutInfo
  5 +
  MAX_PAYOUT_SIZE_PUBLICATION_DATA +
  // contextInfo.size.size, contextInfo.size, contextInfo
  5 +
  MAX_CONTEXT_SIZE_PUBLICATION_DATA;

export const MAX_RAWTX_SIZE_VBK_POP_TX =
  // network byte, type
  1 +
  1 +
  // address.size, address
  1 +
  ADDRESS_SIZE +
  // publishedBlock.size, publishedBlock
  1 +
  VBK_HEADER_SIZE +
  // bitcoinTransaction.size.size, bitcoinTransaction.size, bitcoinTransaction
  5 +
  MAX_RAWTX_SIZE +
  MAX_MERKLE_BYTES +
  // blockOfProof.size, blockOfProof
  1 +
  BTC_HEADER_SIZE +
  // blockOfProofContext.size.size, blockOfProofContext.size, blockOfProofContext
  5 +
  (BTC_HEADER_SIZE + 1) * MAX_CONTEXT_COUNT +
  // signature.size, signature
  1 +
  MAX_SIGNATURE_SIZE +
  // publicKey.size, publicKey
  1 +
  PUBLIC_KEY_SIZE +
  // raw.size.size, raw.size
  5;

export const MAX_RAWTX_SIZE_VBK_TX =
  // network byte, type
  1 +
  1 +
  // sourceAddress.size, sourceAddress
  1 +
  ADDRESS_SIZE +
  // sourceAmount.size, sourceAmount
  1 +
  8 +
  // outputs.size, outputs.size * (output.address.size + output.address + output.amount.size + output.amount)
  1 +
  MAX_OUTPUTS_COUNT * (1 + ADDRESS_SIZE + 1 + 8) +
  // signatureIndex.size, signatureIndex
  1 +
  8 +
  // data.size.size, data.size, data
  5 +
  MAX_SIZE_PUBLICATION_DATA +
  // signature.size, signature
  1 +
  MAX_SIGNATURE_SIZE +
  // publicKey.size, publicKey
  1 +
  PUBLIC_KEY_SIZE +
  // raw.size.size, raw.size
  5;

export const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const BASE59_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0';
