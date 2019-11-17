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
