import { readSingleByteLenValue, readVarLenValue } from './utils';
import {
  ADDRESS_SIZE,
  BTC_HEADER_SIZE,
  HASH256_SIZE,
  MAX_CONTEXT_COUNT,
  MAX_LAYER_COUNT_MERKLE,
  MAX_MERKLE_BYTES,
  MAX_RAWTX_SIZE,
  MAX_RAWTX_SIZE_VBK_POP_TX,
  MAX_SIGNATURE_SIZE,
  PREVIOUS_BLOCK_LENGTH,
  PUBLIC_KEY_SIZE,
  VBK_HEADER_SIZE,
  VBK_MERKLE_ROOT_LENGTH,
} from './const';
import { ReadStream, WriteStream } from './stream';
import { AddressType, Base58, Base59, sha256 } from '../.';

export type Int = number;
export type Short = number;
export type Byte = number;

export class Sha256Hash {
  readonly data!: Buffer;

  constructor(data: Buffer) {
    this.data = data;
  }

  static read(stream: ReadStream, len: number): Sha256Hash {
    return new Sha256Hash(stream.read(len));
  }

  static fromHex(hex: string): Sha256Hash {
    return new Sha256Hash(Buffer.from(hex, 'hex'));
  }
}

export class VBlakeHash {
  readonly data!: Buffer;
  readonly length!: number;

  constructor(data: Buffer) {
    this.data = data;
    this.length = data.length;
  }

  trim(len: number): VBlakeHash {
    if (this.data.length < len) {
      throw new Error(
        `VBlakeHash: can not trim more than ${this.data.length}. Requested ${len}.`
      );
    }
    const sub = this.data.slice(this.data.length - len);
    return new VBlakeHash(sub);
  }

  static read(stream: ReadStream): VBlakeHash {
    return new VBlakeHash(stream.read(PREVIOUS_BLOCK_LENGTH));
  }

  static fromHex(hex: string): VBlakeHash {
    return new VBlakeHash(Buffer.from(hex, 'hex'));
  }
}

export class BtcTx {
  readonly raw!: Buffer;

  static read(stream: ReadStream): BtcTx {
    const raw = readVarLenValue(stream, 0, MAX_RAWTX_SIZE);
    return { raw } as BtcTx;
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
    const version = stream.readInt32LE();
    const previousBlock = readSingleByteLenValue(
      stream,
      HASH256_SIZE,
      HASH256_SIZE
    );
    const merkleRoot = readSingleByteLenValue(
      stream,
      HASH256_SIZE,
      HASH256_SIZE
    );
    const timestamp = stream.readInt32LE();
    const bits = stream.readInt32LE();
    const nonce = stream.readInt32LE();

    return {
      version,
      previousBlock,
      merkleRoot,
      timestamp,
      bits,
      nonce,
    } as BtcBlock;
  }

  static readWithLength(stream: ReadStream): BtcBlock {
    const bytes: Buffer = readSingleByteLenValue(
      stream,
      BTC_HEADER_SIZE,
      BTC_HEADER_SIZE
    );
    const blockStream = new ReadStream(bytes);
    return BtcBlock.read(blockStream);
  }
}

export class MerklePath {
  readonly layers!: Sha256Hash[];
  readonly subject!: Sha256Hash;
  readonly index!: Int;

  static read(stream: ReadStream, subject: Sha256Hash): MerklePath {
    const merkleBytes = readVarLenValue(stream, 0, MAX_MERKLE_BYTES);
    const readable = new ReadStream(merkleBytes);

    const index = readSingleByteLenValue(readable, 4, 4).readInt32BE(0);
    const numLayers = readSingleByteLenValue(readable, 4, 4).readInt32BE(0);
    if (
      !Number.isInteger(numLayers) ||
      numLayers < 0 ||
      numLayers > MAX_LAYER_COUNT_MERKLE
    ) {
      throw new Error(
        `Unexpected numLayers: 0 <= ${numLayers} <= ${MAX_LAYER_COUNT_MERKLE}`
      );
    }

    const sizeOfSizeBottomData = readSingleByteLenValue(
      readable,
      4,
      4
    ).readInt32BE(0);
    const sizeBottomData = readable.read(sizeOfSizeBottomData).readInt32BE(0);

    if (sizeBottomData !== HASH256_SIZE) {
      throw new Error(
        `Unexpected sizeBottomData: ${sizeBottomData} !== ${HASH256_SIZE}`
      );
    }

    const layers: Sha256Hash[] = [];
    for (let i = 0; i < numLayers; i++) {
      const hash = readSingleByteLenValue(readable, HASH256_SIZE, HASH256_SIZE);
      layers.push(hash);
    }

    return {
      index,
      subject,
      layers,
    } as MerklePath;
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

  getHash(): VBlakeHash {
    const stream = new WriteStream(VBK_HEADER_SIZE);
    stream.writeInt32BE(this.height);
    stream.writeInt16BE(this.version);
    stream.write(this.previousBlock.data);
    stream.write(this.previousKeystone.data);
    stream.write(this.secondPreviousKeystone.data);
    stream.write(this.merkleRoot.data);
    stream.writeInt32BE(this.timestamp);
    stream.writeInt32BE(this.difficulty);
    stream.writeInt32BE(this.nonce);
  }

  static read(stream: ReadStream): VbkBlock {
    const height = stream.readInt32BE();
    const version = stream.readInt16BE();
    const previousBlock = VBlakeHash.read(stream);
    const previousKeystone = VBlakeHash.read(stream);
    const secondPreviousKeystone = VBlakeHash.read(stream);
    const merkleRoot = Sha256Hash.read(stream, VBK_MERKLE_ROOT_LENGTH);
    const timestamp = stream.readInt32BE();
    const difficulty = stream.readInt32BE();
    const nonce = stream.readInt32BE();

    return {
      height,
      version,
      previousBlock,
      previousKeystone,
      secondPreviousKeystone,
      merkleRoot,
      timestamp,
      difficulty,
      nonce,
    } as VbkBlock;
  }
}

export enum TxType {
  VBK_TX = 0x01,
  VBK_POP_TX = 0x02,
}

export class VbkPopTx {
  readonly address!: Address;
  readonly publishedBlock!: VbkBlock;
  readonly bitcoinTransaction!: BtcTx;
  readonly merklePath!: MerklePath;
  readonly blockOfProof!: BtcBlock;
  readonly blockOfProofContext!: BtcBlock[];
  readonly signature!: Buffer;
  readonly publicKey!: Buffer;
  readonly networkByte?: Byte;

  static read(stream: ReadStream): VbkPopTx {
    const rawTx = readVarLenValue(stream, 0, MAX_RAWTX_SIZE_VBK_POP_TX);
    const signature = readSingleByteLenValue(
      stream,
      MAX_SIGNATURE_SIZE,
      MAX_SIGNATURE_SIZE
    );
    const publicKey = readSingleByteLenValue(
      stream,
      PUBLIC_KEY_SIZE,
      PUBLIC_KEY_SIZE
    );

    const txStream = new ReadStream(rawTx);

    let networkByte = undefined;
    const networkOrType = txStream.readInt8();
    if (networkOrType !== TxType.VBK_POP_TX) {
      networkByte = networkOrType;
      txStream.readInt8(); // TODO: just skip 1 byte?
    }

    const address = Address.read(txStream);
    const publishedBlock = VbkBlock.read(txStream);
    const bitcoinTransaction = BtcTx.read(txStream);
    const merklePath = MerklePath.read(
      txStream,
      new Sha256Hash(sha256(sha256(bitcoinTransaction.raw)))
    );
    const blockOfProof = BtcBlock.readWithLength(txStream);

    const contextCount = readSingleByteLenValue(
      txStream,
      0,
      MAX_CONTEXT_COUNT
    ).readInt32BE(0);
    if (
      !Number.isInteger(contextCount) ||
      contextCount < 0 ||
      contextCount > MAX_CONTEXT_COUNT
    ) {
      throw new Error(
        `Unexpected context count: ${contextCount} (expected a value between 0 and ${MAX_CONTEXT_COUNT})`
      );
    }

    const blockOfProofContext: BtcBlock[] = [];
    for (let i = 0; i < contextCount; i++) {
      blockOfProofContext.push(BtcBlock.readWithLength(txStream));
    }

    return {
      address,
      publishedBlock,
      bitcoinTransaction,
      merklePath,
      blockOfProof,
      blockOfProofContext,
      signature,
      publicKey,
      networkByte,
    };
  }
}

export class Address {
  // Not sure if other fields are relevant.
  readonly address!: string;

  static read(stream: ReadStream): Address {
    const addressType = stream.readInt8();
    const addressBytes = readSingleByteLenValue(
      stream,
      ADDRESS_SIZE,
      ADDRESS_SIZE
    );
    if (addressType === AddressType.STANDARD) {
      const address = Base58.encode(addressBytes);
      return { address };
    }

    const address = Base59.encode(addressBytes);
    return { address } as Address;
  }
}
