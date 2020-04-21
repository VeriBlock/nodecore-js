import {
  checkLength,
  readArrayOf,
  readNetworkByte,
  readSingleByteLenValue,
  readSingleInt32BEValue,
  readSingleInt64BEValue,
  readVarLenValue,
} from './utils';
import {
  ADDRESS_SIZE,
  BTC_HEADER_SIZE,
  HASH256_SIZE,
  MAX_CONTEXT_COUNT,
  MAX_CONTEXT_COUNT_ALT_PUBLICATION,
  MAX_CONTEXT_SIZE_PUBLICATION_DATA,
  MAX_HEADER_SIZE_PUBLICATION_DATA,
  MAX_LAYER_COUNT_MERKLE,
  MAX_MERKLE_BYTES,
  MAX_OUTPUTS_COUNT,
  MAX_PAYOUT_SIZE_PUBLICATION_DATA,
  MAX_RAWTX_SIZE,
  MAX_RAWTX_SIZE_VBK_POP_TX,
  MAX_RAWTX_SIZE_VBK_TX,
  MAX_SIGNATURE_SIZE,
  MAX_SIZE_PUBLICATION_DATA,
  PREVIOUS_BLOCK_LENGTH,
  PREVIOUS_KEYSTONE_LENGTH,
  PUBLIC_KEY_SIZE,
  VBK_HASH_SIZE,
  VBK_HEADER_SIZE,
  VBK_MERKLE_ROOT_LENGTH,
} from './const';
import { ReadStream, WriteStream } from './stream';
import { AddressType, Base58, Base59, sha256 } from '@veriblock/nodecore-js';
import BigNumber from 'bignumber.js';

export type Long = BigNumber;
export type Int = number;
export type Short = number;
export type Byte = number;

export class Sha256Hash {
  constructor(readonly data: Buffer) {}

  toString(): string {
    return this.data.toString('hex');
  }

  toJSON(): string {
    return this.data.toString('hex');
  }

  // read consumes 1 byte "length"
  static read(stream: ReadStream, len: number): Sha256Hash {
    const data = readSingleByteLenValue(stream, len, len);
    return new Sha256Hash(data);
  }

  // extract does not consume 1 byte "length"
  static extract(stream: ReadStream, len: number): Sha256Hash {
    return new Sha256Hash(stream.read(len));
  }

  static fromHex(hex: string): Sha256Hash {
    return new Sha256Hash(Buffer.from(hex, 'hex'));
  }

  reverse(): Buffer {
    return Buffer.from(this.data.reverse());
  }
}

export class VBlakeHash {
  constructor(readonly data: Buffer, readonly length: number) {
    if (data.length !== length) {
      throw new Error('VBlakeHash: length mismatch');
    }
  }

  toString(): string {
    return this.data.toString('hex');
  }

  toJSON(): string {
    return this.data.toString('hex');
  }

  trim(len: number): VBlakeHash {
    if (this.data.length < len) {
      throw new Error(
        `VBlakeHash: can not trim more than ${this.data.length}. Requested ${len}.`
      );
    }
    const sub = this.data.slice(this.data.length - len);
    return new VBlakeHash(sub, len);
  }

  static read(stream: ReadStream, size: number): VBlakeHash {
    return new VBlakeHash(stream.read(size), size);
  }

  static fromHex(hex: string): VBlakeHash {
    return new VBlakeHash(Buffer.from(hex, 'hex'), VBK_HASH_SIZE);
  }
}

export class Address {
  // Not sure if other fields are relevant.
  constructor(readonly address: string) {}

  toJSON(): string {
    return this.address;
  }

  static read(stream: ReadStream): Address {
    const addressType = stream.readInt8();
    const addressBytes = readSingleByteLenValue(stream, 0, ADDRESS_SIZE);
    let address;
    if (addressType === AddressType.STANDARD) {
      address = Base58.encode(addressBytes);
    } else {
      address = Base59.encode(addressBytes);
    }

    return new Address(address);
  }
}

export class Coin {
  constructor(readonly atomicUnits: Long) {}

  toJSON(): string {
    return this.atomicUnits.toString(10);
  }

  static read(stream: ReadStream): Coin {
    const units = readSingleInt64BEValue(stream);
    return new Coin(units);
  }
}

export class Output {
  constructor(readonly address: Address, readonly amount: Coin) {}

  static read(stream: ReadStream): Output {
    const address = Address.read(stream);
    const amount = Coin.read(stream);

    return new Output(address, amount);
  }
}

export class BtcTx {
  constructor(readonly raw: Buffer) {}

  toJSON(): string {
    return this.raw.toString('hex');
  }

  static read(stream: ReadStream): BtcTx {
    const raw = readVarLenValue(stream, 0, MAX_RAWTX_SIZE);
    return new BtcTx(raw);
  }
}

export class BtcBlock {
  constructor(
    readonly version: Int,
    readonly previousBlock: Sha256Hash,
    readonly merkleRoot: Sha256Hash,
    readonly timestamp: Int,
    readonly bits: Int,
    readonly nonce: Int
  ) {}

  serialize(): Buffer {
    const stream = new WriteStream(BTC_HEADER_SIZE);
    stream.writeInt32LE(this.version);
    stream.write(this.previousBlock.reverse());
    stream.write(this.merkleRoot.reverse());
    stream.writeInt32LE(this.timestamp);
    stream.writeInt32LE(this.bits);
    stream.writeInt32LE(this.nonce);
    return stream.data;
  }

  static extract(stream: ReadStream): BtcBlock {
    const version = stream.readInt32LE();
    const previousBlock = Sha256Hash.extract(stream, HASH256_SIZE);
    const merkleRoot = Sha256Hash.extract(stream, HASH256_SIZE);
    const timestamp = stream.readInt32LE();
    const bits = stream.readInt32LE();
    const nonce = stream.readInt32LE();

    return new BtcBlock(
      version,
      previousBlock,
      merkleRoot,
      timestamp,
      bits,
      nonce
    );
  }

  static read(stream: ReadStream): BtcBlock {
    const bytes: Buffer = readSingleByteLenValue(
      stream,
      BTC_HEADER_SIZE,
      BTC_HEADER_SIZE
    );
    return BtcBlock.extract(new ReadStream(bytes));
  }
}

export class MerklePath {
  constructor(
    readonly layers: Sha256Hash[],
    readonly subject: Sha256Hash,
    readonly index: Int
  ) {}

  static extract(stream: ReadStream, subject: Sha256Hash): MerklePath {
    const index = readSingleInt32BEValue(stream);
    const numLayers = readSingleInt32BEValue(stream);
    if (numLayers < 0 || numLayers > MAX_LAYER_COUNT_MERKLE) {
      throw new Error(
        `Unexpected numLayers: 0 <= ${numLayers} <= ${MAX_LAYER_COUNT_MERKLE}`
      );
    }

    const sizeOfSizeBottomData = readSingleInt32BEValue(stream);
    const sizeBottomData = stream.read(sizeOfSizeBottomData).readInt32BE(0);

    if (sizeBottomData !== HASH256_SIZE) {
      throw new Error(
        `Unexpected sizeBottomData: ${sizeBottomData} !== ${HASH256_SIZE}`
      );
    }

    const layers: Sha256Hash[] = [];
    for (let i = 0; i < numLayers; i++) {
      const hash = Sha256Hash.read(stream, HASH256_SIZE);
      layers.push(hash);
    }

    return new MerklePath(layers, subject, index);
  }

  static read(stream: ReadStream, subject: Sha256Hash): MerklePath {
    const merkleBytes = readVarLenValue(stream, 0, MAX_MERKLE_BYTES);
    return MerklePath.extract(new ReadStream(merkleBytes), subject);
  }
}

export class VbkBlock {
  constructor(
    readonly height: Int,
    readonly version: Short,
    readonly previousBlock: VBlakeHash,
    readonly previousKeystone: VBlakeHash,
    readonly secondPreviousKeystone: VBlakeHash,
    readonly merkleRoot: Sha256Hash,
    readonly timestamp: Int,
    readonly difficulty: Int,
    readonly nonce: Int
  ) {}

  serialize(): Buffer {
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
    return stream.data;
  }

  static extract(stream: ReadStream): VbkBlock {
    const height = stream.readInt32BE();
    const version = stream.readInt16BE();
    const previousBlock = VBlakeHash.read(stream, PREVIOUS_BLOCK_LENGTH).trim(
      PREVIOUS_BLOCK_LENGTH
    );
    const previousKeystone = VBlakeHash.read(
      stream,
      PREVIOUS_KEYSTONE_LENGTH
    ).trim(PREVIOUS_KEYSTONE_LENGTH);
    const secondPreviousKeystone = VBlakeHash.read(
      stream,
      PREVIOUS_KEYSTONE_LENGTH
    ).trim(PREVIOUS_KEYSTONE_LENGTH);
    const merkleRoot = Sha256Hash.extract(stream, VBK_MERKLE_ROOT_LENGTH);
    const timestamp = stream.readInt32BE();
    const difficulty = stream.readInt32BE();
    const nonce = stream.readInt32BE();

    return new VbkBlock(
      height,
      version,
      previousBlock,
      previousKeystone,
      secondPreviousKeystone,
      merkleRoot,
      timestamp,
      difficulty,
      nonce
    );
  }

  static read(stream: ReadStream): VbkBlock {
    // consume 1 byte (length). block itself is next 64 bytes
    const blockBytes = readSingleByteLenValue(
      stream,
      VBK_HEADER_SIZE,
      VBK_HEADER_SIZE
    );

    return VbkBlock.extract(new ReadStream(blockBytes));
  }
}

export enum TxType {
  VBK_TX = 0x01,
  VBK_POP_TX = 0x02,
}

export class VbkPopTx {
  constructor(
    readonly address: Address,
    readonly publishedBlock: VbkBlock,
    readonly bitcoinTransaction: BtcTx,
    readonly merklePath: MerklePath,
    readonly blockOfProof: BtcBlock,
    readonly blockOfProofContext: BtcBlock[],
    readonly signature: Buffer,
    readonly publicKey: Buffer,
    readonly networkByte?: Byte
  ) {}

  toJSON(): object {
    return {
      address: this.address,
      publishedBlock: this.publishedBlock,
      bitcoinTransaction: this.bitcoinTransaction,
      merklePath: this.merklePath,
      blockOfProof: this.blockOfProof,
      blockOfProofContext: this.blockOfProofContext,
      networkByte: this.networkByte,
      signature: this.signature.toString('hex'),
      publicKey: this.publicKey.toString('hex'),
    };
  }

  static extract(
    stream: ReadStream,
    publicKey: Buffer,
    signature: Buffer
  ): VbkPopTx {
    const { networkByte } = readNetworkByte(stream, TxType.VBK_POP_TX);
    const address = Address.read(stream);
    const publishedBlock = VbkBlock.read(stream);
    const bitcoinTransaction = BtcTx.read(stream);
    const merklePath = MerklePath.read(
      stream,
      new Sha256Hash(sha256(sha256(bitcoinTransaction.raw)))
    );
    const blockOfProof = BtcBlock.read(stream);

    const blockOfProofContext = readArrayOf<BtcBlock>(
      stream,
      0,
      4,
      0,
      MAX_CONTEXT_COUNT,
      BtcBlock.read
    );

    return new VbkPopTx(
      address,
      publishedBlock,
      bitcoinTransaction,
      merklePath,
      blockOfProof,
      blockOfProofContext,
      signature,
      publicKey,
      networkByte
    );
  }

  static read(stream: ReadStream): VbkPopTx {
    const rawTx = readVarLenValue(stream, 0, MAX_RAWTX_SIZE_VBK_POP_TX);
    const signature = readSingleByteLenValue(stream, 0, MAX_SIGNATURE_SIZE);
    const publicKey = readSingleByteLenValue(
      stream,
      PUBLIC_KEY_SIZE,
      PUBLIC_KEY_SIZE
    );

    return VbkPopTx.extract(new ReadStream(rawTx), publicKey, signature);
  }
}

export class PublicationData {
  constructor(
    readonly identifier: Long,
    readonly header: Buffer,
    readonly payoutInfo: Buffer,
    readonly contextInfo: Buffer
  ) {}

  toJSON(): object {
    return {
      identifier: this.identifier,
      header: this.header.toString('hex'),
      payoutInfo: this.payoutInfo.toString('hex'),
      contextInfo: this.contextInfo.toString('hex'),
    };
  }

  static read(stream: ReadStream): PublicationData {
    const identifier = readSingleInt64BEValue(stream);
    const headerBytes = readVarLenValue(
      stream,
      0,
      MAX_HEADER_SIZE_PUBLICATION_DATA
    );
    const contextInfoBytes = readVarLenValue(
      stream,
      0,
      MAX_CONTEXT_SIZE_PUBLICATION_DATA
    );
    const payoutInfoBytes = readVarLenValue(
      stream,
      0,
      MAX_PAYOUT_SIZE_PUBLICATION_DATA
    );

    return new PublicationData(
      identifier,
      headerBytes,
      payoutInfoBytes,
      contextInfoBytes
    );
  }
}

export class VbkTx {
  constructor(
    readonly type: Byte,
    readonly sourceAddress: Address,
    readonly sourceAmount: Coin,
    readonly outputs: Output[],
    readonly signatureIndex: Long,
    readonly publicationData: PublicationData,
    readonly signature: Buffer,
    readonly publicKey: Buffer,
    readonly networkByte: Byte | undefined
  ) {}

  toJSON(): object {
    return {
      type: this.type,
      sourceAddress: this.sourceAddress,
      sourceAmount: this.sourceAmount,
      outputs: this.outputs,
      signatureIndex: this.signatureIndex,
      publicationData: this.publicationData,
      networkByte: this.networkByte,
      signature: this.signature.toString('hex'),
      publicKey: this.publicKey.toString('hex'),
    };
  }

  static extract(
    stream: ReadStream,
    publicKey: Buffer,
    signature: Buffer
  ): VbkTx {
    const { typeId, networkByte } = readNetworkByte(stream, TxType.VBK_TX);
    const sourceAddress = Address.read(stream);
    const sourceAmount = Coin.read(stream);
    const outputsSize = stream.readUInt8();
    checkLength(outputsSize, 0, MAX_OUTPUTS_COUNT);

    const outputs: Output[] = [];
    for (let i = 0; i < outputsSize; i++) {
      const output = Output.read(stream);
      outputs.push(output);
    }

    const signatureIndex = readSingleInt64BEValue(stream);
    const publicationDataBytes = readVarLenValue(
      stream,
      0,
      MAX_SIZE_PUBLICATION_DATA
    );
    const publicationData = PublicationData.read(
      new ReadStream(publicationDataBytes)
    );

    return new VbkTx(
      typeId,
      sourceAddress,
      sourceAmount,
      outputs,
      signatureIndex,
      publicationData,
      signature,
      publicKey,
      networkByte
    );
  }

  static read(stream: ReadStream): VbkTx {
    const rawTx = readVarLenValue(stream, 0, MAX_RAWTX_SIZE_VBK_TX);
    const signature = readSingleByteLenValue(stream, 0, MAX_SIGNATURE_SIZE);
    const publicKey = readSingleByteLenValue(
      stream,
      PUBLIC_KEY_SIZE,
      PUBLIC_KEY_SIZE
    );

    return VbkTx.extract(new ReadStream(rawTx), publicKey, signature);
  }
}

export class VbkMerklePath {
  constructor(
    readonly treeIndex: Int,
    readonly layers: Sha256Hash[],
    readonly subject: Sha256Hash,
    readonly index: Int
  ) {}

  static read(stream: ReadStream): VbkMerklePath {
    const treeIndex = readSingleInt32BEValue(stream);
    const index = readSingleInt32BEValue(stream);
    const subjectBuffer = readSingleByteLenValue(
      stream,
      HASH256_SIZE,
      HASH256_SIZE
    );
    const subject = new Sha256Hash(subjectBuffer);
    const layers = readArrayOf<Sha256Hash>(
      stream,
      0,
      4,
      0,
      MAX_LAYER_COUNT_MERKLE,
      (stream: ReadStream) => Sha256Hash.read(stream, HASH256_SIZE)
    );

    return new VbkMerklePath(treeIndex, layers, subject, index);
  }
}

// AltPublication
export class ATV {
  constructor(
    readonly transaction: VbkTx,
    readonly merklePath: VbkMerklePath,
    readonly containingBlock: VbkBlock,
    readonly context: VbkBlock[]
  ) {}

  static read(stream: ReadStream): ATV {
    const transaction = VbkTx.read(stream);
    const merklePath = VbkMerklePath.read(stream);
    const containingBlock = VbkBlock.read(stream);

    const contextBlocks = readArrayOf<VbkBlock>(
      stream,
      0,
      4,
      0,
      MAX_CONTEXT_COUNT_ALT_PUBLICATION,
      VbkBlock.read
    );

    return new ATV(transaction, merklePath, containingBlock, contextBlocks);
  }
}

export class VTB {
  constructor(
    readonly transaction: VbkPopTx,
    readonly merklePath: VbkMerklePath,
    readonly containingBlock: VbkBlock,
    readonly context: VbkBlock[]
  ) {}

  static read(stream: ReadStream): VTB {
    const transaction = VbkPopTx.read(stream);
    const merklePath = VbkMerklePath.read(stream);
    const containingBlock = VbkBlock.read(stream);

    const contextBlocks = readArrayOf<VbkBlock>(
      stream,
      0,
      4,
      0,
      MAX_CONTEXT_COUNT_ALT_PUBLICATION,
      VbkBlock.read
    );

    return new VTB(transaction, merklePath, containingBlock, contextBlocks);
  }
}

export class Context {
  btc: Buffer[] = [];
  vbk: Buffer[] = [];
}

export class Publications {
  atvhex?: string = undefined;
  vtbshex: string[] = [];
  atv?: ATV = undefined;
  vtbs: VTB[] = [];
  context: Context = new Context();
}
