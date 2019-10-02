import { InvalidUnionTypeException } from './exception';

export enum Type {
  ZERO_UNUSED = 0,
  STANDARD = 1,
  PROOF_OF_PROOF = 2,
  MULTISIG = 3,
}

export class Output {
  address?: string;
  amount?: number;
}

class BitcoinBlockHeader {
  header?: string;
}

export class Transaction {
  type?: Type;
  sourceAddress?: string;
  sourceAmount?: number;
  outputs?: Output[];
  transactionFee?: number;
  data?: string;
  bitcoinTransaction?: string;
  endorsedBlockHeader?: string;
  bitcoinBlockHeaderOfProof?: BitcoinBlockHeader;
  merklePath?: string;
  contextBitcoinBlockHeaders?: BitcoinBlockHeader[];
  timestamp?: number;
  size?: number;
  txid?: string;
}

export class SignedTransaction {
  signature?: string;
  publicKey?: string;
  signatureIndex?: number;
  transaction?: Transaction;
}

export class SignedMultisigTransaction {
  // TODO: add fields
}

// union of types
export class TransactionUnion {
  private _unsigned?: Transaction;
  private _signed?: SignedTransaction;
  private _signedMultisig?: SignedMultisigTransaction;

  isUnsigned(): boolean {
    return !!this._unsigned;
  }

  isSigned(): boolean {
    return !!this._signed;
  }

  isSignedMultisig(): boolean {
    return !!this._signedMultisig;
  }

  set unsigned(t: Transaction) {
    this.clear();
    this._unsigned = t;
  }

  set signed(t: SignedTransaction) {
    this.clear();
    this._signed = t;
  }

  set signedMultisig(t: SignedMultisigTransaction) {
    this.clear();
    this._signedMultisig = t;
  }

  get unsigned(): Transaction {
    if (!this._unsigned) {
      throw new InvalidUnionTypeException();
    }

    return this._unsigned;
  }

  get signed(): SignedTransaction {
    if (!this._signed) {
      throw new InvalidUnionTypeException();
    }

    return this._signed;
  }

  get signedMultisigTransaction(): SignedMultisigTransaction {
    if (!this._signedMultisig) {
      throw new InvalidUnionTypeException();
    }

    return this._signedMultisig;
  }

  private clear() {
    this._signed = undefined;
    this._signedMultisig = undefined;
    this._unsigned = undefined;
  }
}
