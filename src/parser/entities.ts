import { Address } from '../types';
import { ReadableStreamBuffer } from 'stream-buffers';
import { Uint16Face, Uint32Face, Uint8Face } from '@1-corp/fixed-size-numbers-ts/lib/Interfaces';
import { readSingleByteLenValue, readVarLenValue } from './utils';
import { HASH256_SIZE, MAX_LAYER_COUNT_MERKLE, MAX_MERKLE_BYTES } from './const';
import { ReadStream } from './stream';
import { Uint8 } from '@1-corp/fixed-size-numbers-ts/lib/Uint';
import BigNumber from 'bignumber.js';

export type VBlakeHash = Buffer;
export type Sha256Hash = Buffer;
export type Int = Uint32Face;
export type Short = Uint16Face;
export type Byte = Uint8Face;

export class BtcTx {
  readonly raw!: Buffer;

  static read(stream: ReadableStreamBuffer): BtcTx {

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
  readonly raw!: Buffer;
  readonly height!: Int;
  readonly version!: Short;
  readonly previousBlock!: VBlakeHash;
  readonly previousKeystone!: VBlakeHash;
  readonly secondPreviousKeystone!: VBlakeHash;
  readonly merkleRoot!: Sha256Hash;
  readonly timestamp!: Int;
  readonly difficulty!: VBlakeHash;
  readonly nonce!: Int;
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

  }
}
