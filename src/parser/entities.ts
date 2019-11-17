import { ReadableStreamBuffer } from 'stream-buffers';
import { Uint16Face, Uint32Face, Uint8Face, Int, Int16Face } from '@1-corp/fixed-size-numbers-ts/lib/Interfaces';
import { readSingleByteLenValue, readVarLenValue } from './utils';
import { HASH256_SIZE, MAX_LAYER_COUNT_MERKLE, MAX_MERKLE_BYTES, MAX_RAW_TX_SIZE_VERI_BLOCK_POP_TX, MAX_SIGNATURE_SIZE, PUBLIC_KEY_SIZE, VERI_BLOCK_POP_TX, ADDRESS_SIZE, BASE58_ALPHABET, BASE59_ALPHABET, PREVIOUS_BLOCK_LENGTH, PREVIOUS_KEYSTONE_LENGTH, VERIBLOCK_MERKLE_ROOT_LENGTH, MAX_RAWTX_SIZE, BTC_HEADER_SIZE, MAX_CONTEXT_COUNT } from './const';
import { ReadStream } from './stream';
import { Uint8, Uint32 } from '@1-corp/fixed-size-numbers-ts/lib/Uint';
import { Base58, Base59, sha256 } from '../.'
import BigNumber from 'bignumber.js';
import { Int32, Int16 } from '@1-corp/fixed-size-numbers-ts/lib/Int';

export type VBlakeHash = Buffer;
export type Sha256Hash = Buffer;
export type Short = Int16Face;
export type Byte = Uint8Face;

export class BtcTx {
  readonly raw!: Buffer;

  static read(stream: ReadStream): BtcTx {
    let raw = readVarLenValue(stream, MAX_RAWTX_SIZE, 0);
    return { raw }
  }
}

export class BtcBlock {
  readonly version!: Int;
  readonly previousBlock!: Sha256Hash;
  readonly merkleRoot!: Sha256Hash;
  readonly timestamp!: Int;
  readonly bits!: Int;
  readonly nonce!: Int;

  static read(stream: ReadStream): BtcBlock {
    let version = stream.readInt32LE();
    let previousBlock = readSingleByteLenValue(stream, HASH256_SIZE, HASH256_SIZE);
    let merkleRoot = readSingleByteLenValue(stream, HASH256_SIZE, HASH256_SIZE);
    let timestamp = stream.readInt32LE();
    let bits = stream.readInt32LE();
    let nonce = stream.readInt32LE();

    return {
      version: Int32(version),
      previousBlock,
      merkleRoot,
      timestamp: Int32(timestamp),
      bits: Int32(bits),
      nonce: Int32(nonce),
    };
  }
}

export class MerklePath {
  readonly layers!: Sha256Hash[];
  readonly subject!: Sha256Hash;
  readonly index!: Int;

  static read(stream: ReadStream, subject: Sha256Hash): MerklePath {
    const merkleBytes = readVarLenValue(stream, 0, MAX_MERKLE_BYTES);
    const readable = new ReadStream(merkleBytes);

    const indexValue = readSingleByteLenValue(readable, 4, 4).readInt32BE(0)
    const index = Uint8(indexValue);
    const numLayers = readSingleByteLenValue(readable, 4, 4).readInt32BE(0);
    if(!Number.isInteger(numLayers) || numLayers < 0 || numLayers > MAX_LAYER_COUNT_MERKLE) {
      throw new Error(`Unexpected numLayers: 0 <= ${numLayers} <= ${MAX_LAYER_COUNT_MERKLE}`);
    }

    const sizeOfSizeBottomData = readSingleByteLenValue(readable, 4, 4).readInt32BE(0);
    const sizeBottomData = readable.read(sizeOfSizeBottomData).readInt32BE(0);

    if(sizeBottomData !== HASH256_SIZE) {
      throw new Error(`Unexpected sizeBottomData: ${sizeBottomData} !== ${HASH256_SIZE}`);
    }

    const layers: Sha256Hash[] = [];
    for(let i=0; i < numLayers ; i++){
      const hash = readSingleByteLenValue(readable, HASH256_SIZE, HASH256_SIZE);
      layers.push(hash);
    }

    return {
      index,
      subject,
      layers,
    } as MerklePath
  }
}

export class VbkBlock {
  readonly height!: Int;
  readonly version!: Short;
  readonly previousBlock!: VBlakeHash;
  readonly previousKeystone!: VBlakeHash;
  readonly secondPreviousKeystone!: VBlakeHash;
  readonly merkleRoot!: Sha256Hash;
  readonly timestamp!: Int;
  readonly difficulty!: Int;
  readonly nonce!: Int;

  static read(stream: ReadStream): VbkBlock {
    let height = stream.readInt32BE();
    let version = stream.readInt16BE();
    let previousBlock = stream.read(PREVIOUS_BLOCK_LENGTH);
    let previousKeystone = stream.read(PREVIOUS_KEYSTONE_LENGTH);
    let secondPreviousKeystone = stream.read(PREVIOUS_KEYSTONE_LENGTH);
    let merkleRoot = stream.read(VERIBLOCK_MERKLE_ROOT_LENGTH);
    let timestamp = stream.readInt32BE();
    let difficulty = stream.readInt32BE();
    let nonce = stream.readInt32BE()

    return {
      height: Int32(height),
      version: Int16(version),
      previousBlock,
      previousKeystone,
      secondPreviousKeystone,
      merkleRoot,
      timestamp: Int32(timestamp),
      difficulty: Int32(difficulty),
      nonce: Int32(nonce),
    }
  }
}

export class VbkPopTx {
  readonly id!: Buffer;
  readonly address!: Address;
  readonly publishedBlock!: VbkBlock;
  readonly bitcoinTransaction!: BtcTx;
  readonly merklePath!: MerklePath;
  readonly blockOfProof!: BtcBlock;
  readonly blockOfProofContext!: BtcBlock[];
  readonly signature!: Buffer;
  readonly publicKey!: Buffer;
  readonly networkByte!: Byte;

  static read(stream: ReadStream) : VbkPopTx {
    let rawTx = readVarLenValue(stream, MAX_RAW_TX_SIZE_VERI_BLOCK_POP_TX);
    let signature = readSingleByteLenValue(stream, MAX_SIGNATURE_SIZE, 0);
    let publicKey = readSingleByteLenValue(stream, PUBLIC_KEY_SIZE, PUBLIC_KEY_SIZE);

    let txStream = new ReadStream(rawTx);

    let networkByte;
    let networkOrType = txStream.readInt8();
    if (networkOrType == VERI_BLOCK_POP_TX) {
      networkByte = null;
    } else {
      networkByte = networkOrType;
      txStream.readInt8();
    }

    let address = Address.read(txStream);
    let publishedBlock = VbkBlock.read(txStream);
    let bitcoinTransaction = BtcTx.read(txStream);
    let merklePath = MerklePath.read(txStream, sha256(sha256(bitcoinTransaction.raw)));
    let blockOfProof = readSingleByteLenValue(txStream, BTC_HEADER_SIZE, BTC_HEADER_SIZE);

    let contextCount = readSingleByteLenValue(txStream, MAX_CONTEXT_COUNT, 0).readInt32BE(0)
    if (contextCount < 0 || contextCount > MAX_CONTEXT_COUNT) {
      throw new Error(`Unexpected context count: ${contextCount} (expected a value between 0 and ${MAX_CONTEXT_COUNT})`)
    }

    let contextBlocks = [];
    for (let i = 0; i < contextCount; i++) {
      contextBlocks.push(readSingleByteLenValue(txStream, BTC_HEADER_SIZE, BTC_HEADER_SIZE))
    }

    return {
      address,
      publishedBlock,
      bitcoinTransaction,
      merklePath,
      blockOfProof,
      contextBlocks,
    }

  }
}

export class Address {
  // Not sure if other fields are relevant.
  readonly address!: string;

  static read(stream: ReadStream): Address {
    let addressType = stream.readInt8();
    let addressBytes = readSingleByteLenValue(stream, ADDRESS_SIZE, 0);
    if (addressType == 1) {
      let address = Base58.encode(addressBytes);
      return { address };
    }

    let address = Base59.encode(addressBytes);
    return { address }
  }
}